import type { FastifyPluginAsync } from "fastify";
import type { MulticaseSendRequest } from "../types/fcm.js";
import { authenticate } from "../middleware/auth.js";
import { fcmMulticastService } from "../services/fcm.multicast.service.js";

const multicastRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: MulticaseSendRequest }>(
    "/multicast",
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: "object",
          required: ["fids"],
          properties: {
            fids: {
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
      return fcmMulticastService.send(request.body);
    },
  );
};

export default multicastRoute;
