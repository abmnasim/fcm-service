import { env } from "../config/env.js";
import { messaging } from "../config/firebase.js";
import type {
  MulticaseSendRequest,
  MulticaseSendResponse,
} from "../types/fcm.js";
import { chunk } from "../utils/chunks.js";
import { isInvalidTokenError } from "./fcm.service.js";

export class FcmMulticastService {
  async send(request: MulticaseSendRequest): Promise<MulticaseSendResponse> {
    const uniqueFids = Array.from(
      new Set(request.fids.map((fid) => fid.trim()).filter(Boolean)),
    );

    if (uniqueFids.length === 0) {
      return {
        success: true,
        totalFids: 0,
        successCount: 0,
        failureCount: 0,
        invalidFids: [],
      };
    }

    if (uniqueFids.length > env.maxTokensPerRequest) {
      throw new Error(`Maximum ${env.maxTokensPerRequest} FIDs allowed`);
    }

    const batches = chunk(uniqueFids, env.batchSize);

    let successCount = 0;
    let failureCount = 0;
    let invalidFids: string[] = [];
    let nextBatchIndex = 0;

    const worker = async (): Promise<void> => {
      while (true) {
        const index = nextBatchIndex++;
        if (index >= batches.length) {
          return;
        }

        const fids = batches[index];

        if (!fids || fids.length === 0) {
          continue;
        }

        const result = await this.sendBatch(fids, request);

        successCount += result.successCount;
        failureCount += result.failureCount;

        invalidFids.push(...result.invalidFids);
      }
    };

    const workerCount = Math.min(env.concurrency, batches.length);

    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    return {
      success: failureCount === 0,
      totalFids: uniqueFids.length,
      successCount,
      failureCount,
      invalidFids,
    };
  }

  private async sendBatch(fids: string[], request: MulticaseSendRequest) {
    const message = {
      fids,
      ...(request.notification
        ? {
            notification: {
              ...(request.notification.title
                ? {
                    title: request.notification.title,
                  }
                : {}),
              ...(request.notification.body
                ? {
                    body: request.notification.body,
                  }
                : {}),
              ...(request.notification.imageUrl
                ? {
                    imageUrl: request.notification.imageUrl,
                  }
                : {}),
            },
          }
        : {}),
      ...(request.data
        ? {
            data: request.data,
          }
        : {}),
    };

    const response = await messaging.sendEachForMulticast(message);

    let successCount = 0;
    let failureCount = 0;
    const invalidFids: string[] = [];

    for (let i = 0; i < response.responses.length; i++) {
      const result = response.responses[i];
      if (result?.success) {
        successCount++;
      } else {
        failureCount++;
        const fid = fids[i];

        if (fid && isInvalidTokenError(result?.error)) {
          invalidFids.push(fid);
        }
      }
    }

    return {
      successCount,
      failureCount,
      invalidFids,
    };
  }
}

export const fcmMulticastService = new FcmMulticastService();
