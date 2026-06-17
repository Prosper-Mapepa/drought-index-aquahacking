import { v1Json } from "@/lib/api-v1";

export async function GET() {
  return v1Json({
    name: "Great Lakes Drought Index API",
    version: "1.0",
    endpoints: [
      {
        path: "/api/v1/drought",
        method: "GET",
        params: ["lat", "lng", "depth?", "yield?", "scenario?", "locale?", "w_spi?", "w_spei?", "w_gw?", "w_yield?"],
        description: "Composite drought score at a point",
      },
      {
        path: "/api/v1/risk",
        method: "GET",
        params: ["lat", "lng", "scenario?", "locale?", "watershed?", "w_spi?", "w_spei?", "w_gw?", "w_yield?"],
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
