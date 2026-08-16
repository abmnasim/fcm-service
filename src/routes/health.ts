import type { FastifyPluginAsync } from "fastify";

const healthRoute: FastifyPluginAsync = async fastify => {
    fastify.get("/health", async () => {
        return {
            success: "ok"
        }
    })
}
export default healthRoute;