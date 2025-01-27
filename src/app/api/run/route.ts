// app/api/run/route.js

import { Client } from "pg";

export async function POST(req: Request): Promise<Response> {
  try {
    const { queryType, tableName, dbConfig } = await req.json();

    // Ensure that the dbConfig is passed in the request
    if (
      !dbConfig ||
      !dbConfig.user ||
      !dbConfig.host ||
      !dbConfig.database ||
      !dbConfig.password ||
      !dbConfig.port
    ) {
      return new Response(
        JSON.stringify({ error: "Missing database configuration details" }),
        { status: 400 }
      );
    }
    const client = new Client(dbConfig); // Use the dbConfig from the request

    await client.connect();

    if (queryType === "tables") {
      // Query to get all tables in the database
      const result = await client.query(`
       SELECT t.table_name, COUNT(c.column_name) AS column_count
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c
        ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
        GROUP BY t.table_name
      `);
      return new Response(JSON.stringify(result.rows), { status: 200 });
    } else if (queryType === "columns" && tableName) {
      // Query to get all columns for the specified table
      const result = await client.query(
        `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
      `,
        [tableName]
      );
      return new Response(JSON.stringify(result.rows), { status: 200 });
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid queryType or missing tableName" }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}
