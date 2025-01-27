import { supabase } from "../../../../utils/supabase/client";

const supabases = supabase
export async function GET(req: Request): Promise<Response> {
  try {
    // Fetch the connection details from Supabase
    const { data, error } = await supabases
      .from("connections") // Replace "connections" with your Supabase table name
      .select("*");

    // Handle any errors from the Supabase query
    if (error) {
      console.error("Error fetching connection:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // If the data exists, return the result
    if (data) {
      return new Response(
        JSON.stringify({
          success: true,
          data,
        }),
        { status: 200 }
      );
    }

    // If no data was found
    return new Response(
      JSON.stringify({ error: "No connection found for the provided ID" }),
      { status: 404 }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      { status: 500 }
    );
  }
}
