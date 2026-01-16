import { NextRequest, NextResponse } from "next/server";
import { getBrandBySlug, updateBrand } from "@/lib/database/queries";
import { PyroVerifyOtpResponse } from "@/lib/types/pyro.types";
import { env } from "@/lib/zod";

const PYRO_BASE_URL = env.PYRO_API_URL;
const PYRO_API_URL = `${PYRO_BASE_URL}/externalauth/verify-otp`;

export const POST = async (req: NextRequest) => {
  try {
    const { email, otp, brandSlug } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and OTP are required",
        },
        { status: 400 },
      );
    }

    if (!brandSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Brand slug is required",
        },
        { status: 400 },
      );
    }

    const apiKey = env.PYRO_API_KEY;

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
      body: JSON.stringify({ email, otp }),
    });

    const data: PyroVerifyOtpResponse = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired OTP",
        },
        { status: 400 },
      );
    }

    // Check if user has a creator account
    if (!data.creator) {
      return NextResponse.json({
        success: true,
        hasCreator: false,
        user: data.user,
        creator: null,
      });
    }

    // Check if brand already has Pyro info set
    const existingBrand = await getBrandBySlug(brandSlug);
    const alreadyHasPyroInfo =
      existingBrand?.pyroMint || existingBrand?.pyroEmail;

    // Only update brand if Pyro info is not already set
    if (!alreadyHasPyroInfo) {
      const updatedBrand = await updateBrand(brandSlug, {
        pyroMint: data.creator.creatorMint,
        pyroEmail: email,
      });

      if (!updatedBrand) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update brand with Pyro info",
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      hasCreator: true,
      user: data.user,
      creator: data.creator,
    });
  } catch (error) {
    console.error("Pyro verify OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify OTP",
      },
      { status: 500 },
    );
  }
};
