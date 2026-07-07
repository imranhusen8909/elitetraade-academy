import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, isSignup } = await request.json();

    // Simple demo validation (in real app use proper database + bcrypt)
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }

    if (isSignup) {
      if (!name) {
        return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
      }
      // Simulate account creation
      return NextResponse.json({
        success: true,
        token: "demo-jwt-token-" + Date.now(),
        user: { email, name, isPremium: false }
      });
    } else {
      // Login
      const isPremium = email.includes("premium") || email === "admin@elitetra.de"; // demo logic

      return NextResponse.json({
        success: true,
        token: "demo-jwt-token-" + Date.now(),
        isPremium,
        user: { email, isPremium }
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}