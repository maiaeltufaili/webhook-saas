import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { generateSignature } from '../utils/crypto';

const prisma = new PrismaClient();
const connection = { host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT) || 6379 };

interface JobData {
  endpointId: string;
  endpointUrl: string;
  secret: string;
  event: string;
  payload: any;
}

export const webhookWorker = new Worker<JobData>(
  'webhook-delivery',
  async (job: Job<JobData>) => {
    const { endpointId, endpointUrl, secret, event, payload } = job.data;
    const attempt = job.attemptsMade + 1;

    const stringifiedPayload = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    const signature = generateSignature(stringifiedPayload, secret);

    try {
      const response = await axios.post(endpointUrl, stringifiedPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Event': event,
        },
        timeout: 5000,
      });

      // Log success to PostgreSQL
      await prisma.deliveryLog.create({
        data: {
          endpointId,
          event,
          payload: stringifiedPayload,
          statusCode: response.status,
          status: 'SUCCESS',
          attempt,
        },
      });

      return { status: response.status, success: true };
    } catch (error: any) {
      const statusCode = error.response ? error.response.status : null;
      const errorMessage = error.message;

      // Log failure to PostgreSQL
      await prisma.deliveryLog.create({
        data: {
          endpointId,
          event,
          payload: stringifiedPayload,
          statusCode,
          status: 'FAILED',
          attempt,
          errorMessage,
        },
      });

      throw new Error(`Delivery failed: ${errorMessage}`);
    }
  },
  {
    connection,
    settings: {
      backoffStrategy: (attemptsMade: number) => Math.pow(3, attemptsMade) * 5000, // Exponential backoff
    },
  }
);