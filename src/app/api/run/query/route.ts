import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

type DBConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

type QueryPayload = {
  dbConfig: DBConfig;
  query: string;
  limit?: number; 
};

// Function to sanitize the query by replacing ${...} with the content inside
const sanitizeQuery = (query: string): string => {
  return query.replace(/\$\{([^}]+)\}/g, (_, content) => content.trim());
};

const createPool = (config: DBConfig) =>
  new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: {
      rejectUnauthorized: false, // For self-signed certs; adjust for production if required
    },
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { dbConfig, query, limit = 10 }: QueryPayload = body;

    // Validate the payload
    if (!dbConfig || !query) {
      return NextResponse.json(
        { error: "Invalid payload. Please provide dbConfig and query." },
        { status: 400 }
      );
    }

    // Sanitize the query to remove placeholders
    const sanitizedQuery = sanitizeQuery(query);

    const queryWithLimit = `${sanitizedQuery} LIMIT ${limit}`;

    const pool = createPool(dbConfig);

    const client = await pool.connect();

    try {
      const result = await client.query(queryWithLimit);
      return NextResponse.json(
        { success: true, data: result.rows },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Query Execution Error:", error.message);
      return NextResponse.json(
        { error: "Failed to execute query.", details: error.message },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Request Handling Error:", error.message);
    return NextResponse.json(
      {
        error: "An error occurred while processing the request.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
