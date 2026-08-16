import { env } from "../config/env.js";
import { messaging } from "../config/firebase.js";
import type { SendRequest, sendResponse } from "../types/fcm.js";
import { chunk } from "../utils/chunks.js";

export function isInvalidTokenError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const value = error as {
    code?: string;
  };

  return (
    value.code == "messaging/registration-token-not-registered" ||
    value.code === "messaging/invalid-registration-token"
  );
}

export class FcmService {
  async send(request: SendRequest): Promise<sendResponse> {
    const uniqueTokens = Array.from(
      new Set(request.tokens.map((token) => token.trim()).filter(Boolean)),
    );

    if (uniqueTokens.length === 0) {
      return {
        success: true,
        totalTokens: 0,
        successCount: 0,
        failureCount: 0,
        invalidTokens: [],
      };
    }

    if (uniqueTokens.length > env.maxTokensPerRequest) {
      throw new Error(`Maximum ${env.maxTokensPerRequest} tokens allowed`);
    }

    const batches = chunk(uniqueTokens, env.batchSize);
    let successCount = 0;
    let failureCount = 0;
    const invalidTokens: string[] = [];

    let nextBatchIndex = 0;
    const worker = async (): Promise<void> => {
      while (true) {
        const index = nextBatchIndex++;
        if (index >= batches.length) {
          return;
        }

        const tokens = batches[index];
        if (!tokens || tokens.length === 0) {
          return;
        }
        const result = await this.sendBatch(tokens, request);
        successCount += result.successCount;
        failureCount += result.failureCount;
        invalidTokens.push(...result.invalidTokens);
      }
    };

    const workerCount = Math.min(env.concurrency, batches.length);
    await Promise.all(
      Array.from(
        {
          length: workerCount,
        },
        () => worker(),
      ),
    );

    return {
      success: failureCount === 0,
      totalTokens: uniqueTokens.length,
      successCount,
      failureCount,
      invalidTokens,
    };
  }

  private async sendBatch(tokens: string[], request: SendRequest) {
    const message = {
      tokens,
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
    const invalidTokens: string[] = [];
    for (let i = 0; i < response.responses.length; i++) {
      const result = response.responses[i];
      if (result?.success) {
        successCount++;
      } else {
        failureCount++;
        const token = tokens[i];

        if (token && isInvalidTokenError(result?.error)) {
          invalidTokens.push(token);
        }
      }
    }
    return {
      successCount,
      failureCount,
      invalidTokens,
    };
  }
}

export const fcmService = new FcmService();
