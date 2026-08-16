import type { FastifyRegister, FastifyReply, FastifyRequest } from "fastify";
import { timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

function safeEqual(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);

    if (aBuffer.length !== bBuffer.length) {
        return false;
    }

    return timingSafeEqual(aBuffer, bBuffer);
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers["x-api-key"];

    if (typeof apiKey !== "string" || !safeEqual(apiKey, env.apiKey)) {
        return reply.code(401).send({success: false, error: "Unauthorized"});
    }
}