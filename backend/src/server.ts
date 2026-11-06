import express, { Request, Response } from 'express';
import { Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import './workers/webhookWorker';

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();
const connection = { host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT) || 6379 };
const webhookQueue = new Queue('webhook-delivery', { connection });

// Register Webhook Endpoint
app.post('/api/endpoints', async (req: Request, res: Response) => {
  const { url, events, secret } = req.body;
  try {
    const endpoint = await prisma.endpoint.create({
      data: { url, events, secret },
    });
    return res.status(201).json(endpoint);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// List Endpoints & Recent Logs
app.get('/api/endpoints', async (req: Request, res: Response) => {
  const endpoints = await prisma.endpoint.findMany({
    include: { logs: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });
  return res.json(endpoints);
});

// Trigger Event (Dispatches Webhooks)
app.post('/api/trigger', async (req: Request, res: Response) => {
  const { event, payload } = req.body;

  const endpoints = await prisma.endpoint.findMany({
    where: { events: { has: event } },
  });

  const jobs = endpoints.map((endpoint) =>
    webhookQueue.add(
      'deliver',
      {
        endpointId: endpoint.id,
        endpointUrl: endpoint.url,
        secret: endpoint.secret,
        event,
        payload,
      },
      { attempts: 4, backoff: { type: 'exponential', delay: 5000 } }
    )
  );

  await Promise.all(jobs);

  return res.json({ message: `Event ${event} dispatched to ${endpoints.length} endpoints.` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));