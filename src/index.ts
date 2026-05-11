import { serve } from "bun";
import index from "./index.html";
import { authHandler } from "./api/auth";
import { usersHandler } from "./api/users";
import { adminHandler } from "./api/admin";

const server = serve({
  routes: {
    "/api/auth/*": async (req: Request) => await authHandler(req),
    "/api/admin/*": async (req: Request) => await adminHandler(req),
    "/api/users/*": async (req: Request) => await usersHandler(req),
    "/api/posts/*": async (req: Request) => await (await import("./api/posts")).postsHandler(req),
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
