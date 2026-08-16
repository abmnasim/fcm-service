import type { FastifyPluginAsync } from "fastify";
import type { SendRequest } from "../types/fcm.js";
import { authenticate } from "../middleware/auth.js";
import { fcmService } from "../services/fcm.service.js";

const sendRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: SendRequest }>(
    "/send",
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: "object",
          required: ["tokens"],
          properties: {
            tokes: {
              type: "array",
              minItems: 1,
              maxItems: 10000,
              items: {
                type: "string",
                minLength: 1,
              },
            },
            notification: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  maxLength: 512,
                },
                body: {
                  type: "string",
                  maxLength: 4096,
                },
                imageUrl: {
                  type: "string",
                  maxLength: 2048,
                },
              },
              additionalProperties: false,
            },
            data: {
              type: "object",
              additionalProperties: {
                type: "string",
              },
              maxProperties: 100,
            },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      return fcmService.send(request.body);
    },
  );
};

export default sendRoute;
