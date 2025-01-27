import { Client } from "pg";

export async function POST(req: Request): Promise<Response> {
  try {
    const { tableName, dbConfig } = await req.json();

    // Validate the database configuration
    if (
      !dbConfig ||
      !dbConfig.user ||
      !dbConfig.host ||
      !dbConfig.database ||
      !dbConfig.password ||
      !dbConfig.port
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing or incomplete database configuration details",
        }),
        { status: 400 }
      );
    }

    const client = new Client(dbConfig);

    await client.connect();

    let result;

    if (tableName) {
      // Query to get columns for the specified table
      result = await client.query(
        `
        SELECT 
          column_name, 
          data_type 
        FROM 
          information_schema.columns
        WHERE 
          table_schema = 'public'
          AND table_name = $1
        ORDER BY 
          ordinal_position
        `,
        [tableName]
      );
      // Return the result for the specific table
      return new Response(JSON.stringify(result.rows), { status: 200 });
    } else {
      // Query to get all tables and their columns
      result = await client.query(`
        SELECT 
          t.table_name, 
          c.column_name
        FROM 
          information_schema.tables t
        JOIN 
          information_schema.columns c
        ON 
          t.table_name = c.table_name
        WHERE 
          t.table_schema = 'public'
        ORDER BY 
          t.table_name, c.ordinal_position
      `);

      // Group the result by table_name and collect the column names
      const groupedResult = result.rows.reduce((acc: any, row: any) => {
        // If the table doesn't exist in the accumulator, create it
        if (!acc[row.table_name]) {
          acc[row.table_name] = [];
        }

        // Add the column name to the respective table
        acc[row.table_name].push(row.column_name);

        return acc;
      }, {});

      // Convert the grouped result into an array format
      const finalResult = Object.entries(groupedResult).map(
        ([table_name, columns]) => ({
          table_name,
          columns,
        })
      );

      // Return the grouped result
      return new Response(JSON.stringify(finalResult), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}
