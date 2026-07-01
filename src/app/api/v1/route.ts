import { v1Json } from "@/lib/api-v1";

export async function GET() {
  return v1Json({
    name: "LAPARA IRHT Platform API",
    version: "1.0",
    endpoints: [
      {
        path: "/api/v1/irht",
        method: "GET",
        params: ["lat", "lng", "depth?", "yield?", "scenario?", "locale?", "watershed?"],
        description: "Territorial Hydric Resilience Index (IRHT) with 6-component breakdown",
      },
      {
        path: "/api/v1/drought",
        method: "GET",
        params: ["lat", "lng", "depth?", "yield?", "scenario?", "locale?", "watershed?"],
        description: "IRHT drought score at a point (includes legacy composite field)",
      },
      {
        path: "/api/v1/risk",
        method: "GET",
        params: ["lat", "lng", "scenario?", "locale?", "watershed?"],
        description: "Investment risk report at a point",
      },
      {
        path: "/api/v1/scenarios",
        method: "GET",
        description: "Available climate scenarios",
      },
    ],
    docs: "/docs",
  });
}
