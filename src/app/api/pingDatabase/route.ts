// app/api/pingDatabase/route.ts

import { Client } from "pg";

// Define the request body interface for type safety

export async function POST(req: Request): Promise<Response> {
  // Parse the incoming JSON request body
  const { host, port, databaseName, username, password }: PingRequestBody = await req.json();

  // Validate the required fields
  if (!host || !port || !databaseName || !username || !password) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400 }
    );
  }

  // Create a new PostgreSQL client
  const client = new Client({
    user: username,
    host: host,
    database: databaseName,
    password: password,
    port: port,
  });

  try {
    // Attempt to connect to the database
    await client.connect();
    return new Response(
      JSON.stringify({ status: "success", message: "Database connection successful!" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: "error", message: (error as Error).message }),
      { status: 500 }
    );
  } finally {
    // Always end the database connection
    await client.end();
  }
}
