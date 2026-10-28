import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Handler for generating AI productivity report & history tracking
  const handleReportGeneration = async (req: express.Request, res: express.Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not set. Please provide GEMINI_API_KEY in your environment variables.',
        });
      }

      const client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const { tasks = [], history = [], timeframe = 'weekly' } = req.body;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t: any) => t.completed).length;
      const pendingTasks = tasks.filter((t: any) => !t.completed).length;
      const todayStr = new Date().toISOString().split('T')[0];
      const overdueTasks = tasks.filter((t: any) => !t.completed && t.dueDate && t.dueDate < todayStr);

      const prompt = `You are an executive productivity coach and performance analyst for the TaskFlow app.
Analyze the user's workload, completion timeline, task history, and overdue bottlenecks.
Generate a high-impact, motivational, structured productivity report in clean Markdown.

Summary Metrics:
- Timeframe: ${timeframe}
- Total Tasks: ${totalTasks}
- Completed: ${completedTasks}
- Active Pending: ${pendingTasks}
- Overdue: ${overdueTasks.length}

Recent Task History Events:
${JSON.stringify(history.slice(-25), null, 2)}

Active Workload & Tasks:
${JSON.stringify(
  tasks.map((t: any) => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    completed: t.completed,
    completedPomodoros: t.completedPomodoros,
    tags: t.tags,
  })),
  null,
  2
)}

Format your output using clear markdown with headings, bullet points, and quantitative observations:
## 🏆 Performance Overview & Momentum Score
Rate their weekly momentum out of 100 with an encouraging breakdown.

## ✅ Accomplishments & Key Wins
Summarize what was finished, milestone completions, and focus areas.

## ⚠️ Bottleneck & Overdue Analysis
Constructively flag tasks that are overdue or lagging, explaining why they matter and how to unblock them.

## 📋 Prioritized Action Plan for Next Period
3 to 5 concrete, bite-sized recommendations to tackle first.

## 💡 Productivity Mindset & Pro-Tip
A sharp, customized strategy tip based specifically on the user's workload distribution.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ report: response.text });
    } catch (err: any) {
      console.error('Error generating AI productivity report:', err);
      return res.status(500).json({
        error: err.message || 'An error occurred while generating the productivity report.',
      });
    }
  };

  // Support both /api/report and /api/gemini/report
  app.post('/api/report', handleReportGeneration);
  app.post('/api/gemini/report', handleReportGeneration);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`TaskFlow Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
