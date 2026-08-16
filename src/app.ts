import Fastify, { type FastifyError } from "fastify";
import { env } from "./config/env.js";
import healthRoute from "./routes/health.js";
import sendRoute from "./routes/fcm.send.route.js";
import multicastRoute from "./routes/fcm.multicast.route.js";

export function createApp() {
  const app = Fastify({
    logger: env.nodeEnv !== "production",
    disableRequestLogging: env.nodeEnv !== "production",
    bodyLimit: 2 * 1024 * 1024,
    requestTimeout: 30_000,
    keepAliveTimeout: 72_000,
    forceCloseConnections: "idle",
  });

  app.register(healthRoute);

  app.register(multicastRoute, {
    prefix: "/v1/fcm",
  });

  app.register(sendRoute, {
    prefix: "/v1/fcm",
  });

  app.setErrorHandler(async (error, request, reply) => {
    request.log.error(error);

    const fastifyError = error as FastifyError;

    if (fastifyError.validation) {
      return reply
        .code(400)
        .send({
          success: false,
          error: "Invalid request",
          details: fastifyError.validation,
        });
    }

    return reply.code(500).send({
      success: false,
      error: "Internal server error",
    });
  });
  return app;
}
