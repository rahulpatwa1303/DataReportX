import { NextResponse } from "next/server";
import { supabase } from "../../../../utils/supabase/client";

const supabases = supabase

// Helper function to insert data into Supabase
async function insertReport(formData: any) {
  const { name, connectionId, query, xaxis, yaxis, chart_type, user_id } =
    formData;

  // Validate connectionId by checking if it exists in the 'connections' table
  const { data: connection, error: connectionError } = await supabases
    .from("connections")
    .select("id")
    .eq("id", connectionId)
    .single();

  if (connectionError) {
    throw new Error("Invalid connectionId: " + connectionError.message);
  }

  // Insert the data into the 'reports' table
  const { data, error } = await supabases
    .from("reports")
    .insert([
      {
        name,
        connection_id: connectionId,
        query,
        x_axis_field: xaxis,
        y_axis_field: yaxis.join(", "), // Store y-axis fields as a comma-separated string
        chart_type,
        user_id,
      },
    ])
    .select("*"); // Return the inserted row

  if (error) {
    throw new Error("Failed to insert report: " + error.message);
  }

  return data[0]; // Return the inserted row
}

// API Route Handler
export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { name, connectionId, query, xaxis, yaxis, chart_type, user_id } =
      body;

    // Validate required fields
    if (!name || !connectionId || !query) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert report into the database
    const insertedReport = await insertReport({
      name,
      connectionId,
      query,
      xaxis,
      yaxis,
      chart_type,
      user_id,
    });

    // Return the inserted report data
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "An error occurred while processing the request.",
      },
      { status: 500 }
    );
  }
}

async function updateReport(id: number, formData: any) {
  const { name, connectionId, query, xaxis, yaxis, chart_type, user_id } =
    formData;

  // Validate connectionId by checking if it exists in the 'connections' table
  const { data: connection, error: connectionError } = await supabases
    .from("connections")
    .select("id")
    .eq("id", connectionId)
    .single();

  if (connectionError) {
    throw new Error("Invalid connectionId: " + connectionError.message);
  }

  // Update the row in the 'reports' table
  const { data, error } = await supabases
    .from("reports")
    .update({
      name,
      connection_id: connectionId,
      query,
      x_axis_field: xaxis,
      y_axis_field: yaxis.join(", "), // Store y-axis fields as a comma-separated string
      chart_type,
      user_id,
    })
    .eq("id", id) // Update only the row with the specified ID
    .select("*"); // Return the updated row

  if (error) {
    throw new Error("Failed to update report: " + error.message);
  }

  return data[0]; // Return the updated row
}

export async function PUT(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");

    // Convert the id to a number and handle the case where it's null or not a valid number
    const id = idParam ? parseInt(idParam, 10) : null;

    if (id === null || isNaN(id)) {
      throw new Error("Invalid or missing 'id' parameter");
    }
    const { name, connectionId, query, xaxis, yaxis, chart_type, user_id } =
      body;

    // Validate required fields
    if (!id || !name || !connectionId || !query) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the report in the database
    const updatedReport = await updateReport(id, {
      name,
      connectionId,
      query,
      xaxis,
      yaxis,
      chart_type,
      user_id,
    });

    // Return the updated report data
    return Response.json(
      { success: true, data: updatedReport },
      { status: 200 }
    );
  } catch (error) {
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
      .from("reports") // Replace "connections" with your Supabase table name
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
