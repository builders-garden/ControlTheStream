import { NextRequest, NextResponse } from "next/server";
import { PyroRequestOtpResponse } from "@/lib/types/pyro.types";

const PYRO_BASE_URL = process.env.PYRO_API_URL || "https://www.pyro.buzz";
const PYRO_API_URL = `${PYRO_BASE_URL}/api/externalauth/request-otp`;

export const POST = async (req: NextRequest) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.PYRO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Pyro API key not configured",
        },
        { status: 500 },
      );
    }

    const response = await fetch(PYRO_API_URL, {
      method: "POST",
      headers: {
        "X-External-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data: PyroRequestOtpResponse = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || `Pyro API error: ${response.status}`,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      email: data.email,
    });
  } catch (error) {
    console.error("Pyro request OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to request OTP",
      },
      { status: 500 },
    );
  }
};
