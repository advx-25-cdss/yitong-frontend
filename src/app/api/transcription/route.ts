import { NextRequest, NextResponse } from "next/server";

const FLASK_BACKEND_URL =
  process.env.FLASK_BACKEND_URL || "http://localhost:5000";

// POST /api/transcribe-chunk
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward the form data to Flask backend
    const response = await fetch(`${FLASK_BACKEND_URL}/transcribe-chunk`, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type, let fetch set it for FormData
      },
    });

    if (!response.ok) {
      throw new Error(`Flask backend responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error forwarding to Flask backend:", error);
    return NextResponse.json(
      { error: "Failed to process transcription chunk" },
      { status: 500 },
    );
  }
}

// GET /api/get-latest-transcription
export async function GET() {
  try {
    const response = await fetch(
      `${FLASK_BACKEND_URL}/get-latest-transcription`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Flask backend responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting transcription from Flask backend:", error);
    return NextResponse.json(
      { segments: [] },
      { status: 200 }, // Return empty segments instead of error
    );
  }
}
