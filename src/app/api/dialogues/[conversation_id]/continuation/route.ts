import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8080";

export async function POST(
  request: NextRequest,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const { conversation_id } = params;
    const body = await request.json();

    const response = await fetch(
      `${PYTHON_BACKEND_URL}/dialogues/${conversation_id}/continuation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Python backend responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error continuing dialogue:", error);
    return NextResponse.json(
      { error: "Failed to continue dialogue" },
      { status: 500 }
    );
  }
}
