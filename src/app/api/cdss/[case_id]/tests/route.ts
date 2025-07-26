import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8080";

export async function POST(
  request: NextRequest,
  { params }: { params: { case_id: string } }
) {
  try {
    const { case_id } = params;

    const response = await fetch(`${PYTHON_BACKEND_URL}/${case_id}/tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Python backend responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting test recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get test recommendations" },
      { status: 500 }
    );
  }
}
