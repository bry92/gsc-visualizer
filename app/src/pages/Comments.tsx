import { useEffect, useState } from "react";

type Comment = {
  id: number;
  comment: string;
};

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/comments");
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const data = (await res.json()) as Comment[];
        setComments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  return (
    <main className="min-h-screen bg-dark px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-lime/70">Aurora Serverless</p>
          <h1 className="text-3xl font-semibold">Comments (PostgreSQL)</h1>
          <p className="text-sm text-white/70">
            Reads data from `/api/comments` through a Vercel function using Aurora IAM auth.
          </p>
        </div>

        <section className="rounded-lg border border-lime/15 bg-black/40 p-4 shadow-xl">
          {loading && <p className="text-white/80">Loading comments...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && comments.length === 0 && (
            <p className="text-white/60">The table exists, but there are no comments yet.</p>
          )}
          {!loading && !error && comments.length > 0 && (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-md border border-lime/10 bg-white/5 px-3 py-2 shadow-sm"
                >
                  <p className="text-base leading-relaxed">{comment.comment}</p>
                  <span className="text-xs text-white/50">#{comment.id}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-xs text-white/50">
          Use `npm run vercel:pull` to sync Aurora env vars and `npm run dev:vercel` to run the SPA and
          function locally. The `comments` table is created automatically on the first API request.
        </p>
      </div>
    </main>
  );
}
