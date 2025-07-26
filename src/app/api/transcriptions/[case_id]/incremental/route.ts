import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8080";

export async function PUT(
  request: NextRequest,
  { params }: { params: { case_id: string } }
) {
  try {
    const { case_id } = params;
    const body = await request.json();

    const response = await fetch(`${PYTHON_BACKEND_URL}/${case_id}/incremental`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Python backend responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving transcription:", error);
    return NextResponse.json(
      { error: "Failed to save transcription" },
      { status: 500 }
    );
  }
}
