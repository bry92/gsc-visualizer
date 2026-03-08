import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Signer } from "@aws-sdk/rds-signer";
import { ClientBase, Pool } from "pg";

/**
 * Shared PostgreSQL pool for Aurora Serverless with IAM auth.
 * This file is meant to be imported from API routes only (server-side).
 */
function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const region = getRequiredEnv("AWS_REGION");

const signer = new Signer({
  hostname: getRequiredEnv("PGHOST"),
  port: Number(getRequiredEnv("PGPORT")),
  username: getRequiredEnv("PGUSER"),
  region,
  credentials: awsCredentialsProvider({
    roleArn: getRequiredEnv("AWS_ROLE_ARN"),
    clientConfig: { region },
  }),
});

const pool = new Pool({
  host: getRequiredEnv("PGHOST"),
  user: getRequiredEnv("PGUSER"),
  database: process.env.PGDATABASE || "postgres",
  // The auth token value can be cached for up to 15 minutes (900 seconds) if desired.
  password: () => signer.getAuthToken(),
  port: Number(getRequiredEnv("PGPORT")),
  // Recommended to switch to `true` in production.
  // See https://docs.aws.amazon.com/lambda/latest/dg/services-rds.html#rds-lambda-certificates
  ssl: { rejectUnauthorized: false },
  max: 20,
});

// Hint to Vercel runtime to reuse the pool across invocations.
attachDatabasePool(pool);

// Single query transaction.
export async function query(sql: string, args: unknown[] = []) {
  return pool.query(sql, args);
}

let commentsTableReady: Promise<void> | null = null;

export async function ensureCommentsTable() {
  if (!commentsTableReady) {
    commentsTableReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          comment TEXT
        )
      `)
      .then(() => undefined)
      .catch((error) => {
        commentsTableReady = null;
        throw error;
      });
  }

  await commentsTableReady;
}

// Use it for multiple queries transaction.
export async function withConnection<T>(fn: (client: ClientBase) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
