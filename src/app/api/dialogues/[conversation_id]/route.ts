import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const { conversation_id } = params;

    const response = await fetch(
      `${PYTHON_BACKEND_URL}/dialogues/${conversation_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Python backend responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting dialogue:", error);
    return NextResponse.json(
      { error: "Failed to get dialogue" },
      { status: 500 }
    );
  }
}
