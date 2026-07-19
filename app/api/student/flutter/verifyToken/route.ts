import { NextResponse } from "next/server";
import { comparePasswords, generateAccessToken, generateRefreshToken, verifyAccessToken } from "@/lib/utils";


export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: {
      "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }, });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token) as { id: string };
    if(!payload.id){
        return NextResponse.json({ message: "Token expired or invalid" }, { status: 401, headers: {
      "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }, });
    }
    return NextResponse.json({ check: true },
      {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  }
    );
  } catch {
    return NextResponse.json({ error: "Token expired or invalid" }, { status: 401, headers: {
      "Access-Control-Allow-Origin": "*", // ✅ allow all origins (or specify your domain)
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }, });
  }
}