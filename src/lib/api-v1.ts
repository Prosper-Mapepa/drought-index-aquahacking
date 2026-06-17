import { NextResponse } from "next/server";

export const API_VERSION = "1.0";

export function v1Json<T>(data: T, status = 200) {
  return NextResponse.json(
    { version: API_VERSION, data },
    {
      status,
      headers: {
        "X-API-Version": API_VERSION,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

export function v1Error(message: string, status: number) {
  return NextResponse.json(
    { version: API_VERSION, error: message },
    { status, headers: { "X-API-Version": API_VERSION } }
  );
}
