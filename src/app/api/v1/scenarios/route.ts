import { CLIMATE_SCENARIOS } from "@/lib/scenarios";
import { v1Json } from "@/lib/api-v1";

export async function GET() {
  return v1Json(
    CLIMATE_SCENARIOS.map(({ id, label, description, year, rcp }) => ({
      id,
      label,
      description,
      year,
      rcp,
    }))
  );
}
