import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is missing on Vercel. Please add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.',
    });
  }

  try {
    const client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { tasks = [], history = [], timeframe = 'weekly' } = body;

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

    return res.status(200).json({ report: response.text });
  } catch (err: any) {
    console.error('Vercel API error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate report with Gemini API on Vercel.',
    });
  }
}
