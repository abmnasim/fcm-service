import "dotenv/config"

function numberEnv(name: string, defaultValue: number): number {
    const value = process.env[name];

    if (!value) {
        return defaultValue
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        throw new Error(`${name} must be a valid number`);
    }
    return parsed;
}

const apiKey = process.env.FCM_API_KEY;

if (!apiKey) {
    throw new Error("FCM_API_KEY is missing");
}

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    host: process.env.HOST ?? "127.0.0.1",
    port: numberEnv("PORT", 8080),
    apiKey,
    batchSize: numberEnv("FCM_BATCH_SIZE", 500),
    concurrency: numberEnv("FCM_CONCURRENCY", 8),
    maxTokensPerRequest: numberEnv("MAX_TOKENS_PER_REQUEST", 10000)
}