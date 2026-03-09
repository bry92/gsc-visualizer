import type { IncomingMessage, ServerResponse } from "http";
import { ensureCommentsTable, query } from "./_db";

// GET /api/comments -> returns all comments (id, comment)
export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method Not Allowed");
    return;
  }

  try {
    await ensureCommentsTable();
    const { rows } = await query("SELECT id, comment FROM comments ORDER BY id DESC", []);
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify(rows));
  } catch (error) {
    console.error("Failed to fetch comments", error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
