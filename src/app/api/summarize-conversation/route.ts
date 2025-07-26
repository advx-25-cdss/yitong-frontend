import { NextRequest, NextResponse } from "next/server";

const FLASK_BACKEND_URL =
  process.env.FLASK_BACKEND_URL || "http://localhost:5000";

// POST /api/summarize-conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the request to FastAPI backend
    const response = await fetch(
      `${FLASK_BACKEND_URL}/summarize-conversation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`FastAPI backend responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error forwarding to FastAPI backend:", error);
    return NextResponse.json(
      { error: "Failed to summarize conversation" },
      { status: 500 },
    );
  }
}
