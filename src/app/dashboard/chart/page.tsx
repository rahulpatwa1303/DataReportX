import { Card } from "@/components/ui/card";
import ChartsCard from "../reports/component/ChartsCard";
import Graph from "./component/Graph";
import { supabase } from "../../../../utils/supabase/client";

async function fetchConnectionDetails(connectionId: number) {
  const supabases = supabase
  const { data, error } = await supabases
    .from("connections")
    .select("*")
    .eq("id", connectionId)
    .single();

  if (error) {
    console.error("Error fetching connection details:", error.message);
    return null;
  }
  return data;
}

async function fetchReports() {
  const supabases = supabase
  const { data, error } = await supabases.from("reports").select("*");
  if (error) {
    console.error("Error fetching reports:", error.message);
    return [];
  }
  return data;
}

async function runQuery(
  connectionDetails: {
    host: string;
    port: number;
    database_name: string;
    username: string;
    password: string;
  },
  query: string
) {
  const { host, port, database_name, username, password } = connectionDetails;

  // Assuming you're using a PostgreSQL client like pg for server-side query execution
  const { Pool } = require("pg");
  const pool = new Pool({
    host,
    port,
    database: database_name,
    user: username,
    password,
  });

  try {
    const queryWithLimit = `${query} LIMIT ${10}`;
    const result = await pool.query(queryWithLimit); // Run the query
    return result.rows; // Return query result rows
  } catch (error) {
    console.error(
      "Query execution error:",
      (error as { message: string }).message
    );
    return null;
  } finally {
    pool.end(); // Ensure the pool is closed after the query
  }
}

async function Charts() {
  const reports = await fetchReports(); // Fetch reports from Supabase
  const results = [];

  // Fetch data for each report
  for (const report of reports) {
    const connectionDetails = await fetchConnectionDetails(
      report.connection_id
    );

    if (connectionDetails) {
      // Sanitize query (if needed)
      const sanitizedQuery = report.query.replace(
        /\$\{([^}]+)\}/g,
        (_: any, content: string) => content.trim()
      );

      // Run query with connection details
      const queryResult = await runQuery(connectionDetails, sanitizedQuery);

      // Store the result
      results.push({
        reportId: report.id,
        queryResult,
        report, // Store the specific report details
      });
    }
  }

  // Render the results (you can modify this part as needed)
  return (
    <div className="mx-8 space-y-4 w-full">
      <h1>Reports</h1>
      {results.length === 0 ? (
        <p>No reports found or no query results available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
          {results.map(({ reportId, queryResult, report }, index) => {
            return (
              <div key={index}>
                <Card>
                  {queryResult ? (
                    <Graph queryResult={queryResult} report={report} />
                  ) : (
                    <p>No results for this report.</p>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Charts;
