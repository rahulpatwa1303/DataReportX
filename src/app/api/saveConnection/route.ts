import { supabase } from "../../../../utils/supabase/client";

const supabases = supabase

export async function POST(req: Request): Promise<Response> {
  try {
    const { user_id, host, port, database_name, username, password } =
      await req.json();

    // Validate input data (relying on client-side validation)
    if (
      !user_id ||
      !host ||
      !port ||
      !database_name ||
      !username ||
      !password
    ) {
      return new Response(
        JSON.stringify({ error: "All fields are required." }),
        { status: 400 }
      );
    }

    // Insert into Supabase table 'connections'
    const { data, error } = await supabases.from("connections").insert([
      {
        user_id,
        host,
        port,
        database_name,
        username,
        password,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Connection saved successfully.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving connection:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      { status: 500 }
    );
  }
}

export async function GET(req: Request): Promise<Response> {
  try {
    // Extract the 'id' parameter from the URL
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    // Validate that the 'id' exists
    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
      });
    }

    // Fetch the connection details from Supabase
    const { data, error } = await supabases
      .from("connections") // Replace "connections" with your Supabase table name
      .select("*")
      .eq("id", id)
      .single();

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
