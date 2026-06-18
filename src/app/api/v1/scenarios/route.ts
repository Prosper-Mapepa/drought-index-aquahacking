import { CLIMATE_SCENARIOS, DEFAULT_CUSTOM_SCENARIO } from "@/lib/scenarios";
import { v1Json } from "@/lib/api-v1";

export async function GET() {
  return v1Json({
    presets: CLIMATE_SCENARIOS.map(
      ({ id, label, description, year, rcp, timescale, percentile }) => ({
        id,
        label,
        description,
        year,
        rcp,
        timescale,
        percentile,
      })
    ),
    custom: {
      id: "custom",
      description: {
        en: "Build a custom scenario with GeoMet SPEI projection layers",
        fr: "Construire un scénario personnalisé avec les couches SPEI GeoMet",
      },
      parameters: {
        timescale: { type: "integer", values: [1, 3, 12], default: DEFAULT_CUSTOM_SCENARIO.timescale },
        rcp: { type: "string", values: ["2.6", "4.5", "8.5"], default: DEFAULT_CUSTOM_SCENARIO.rcp },
        percentile: { type: "integer", values: [25, 50, 75], default: DEFAULT_CUSTOM_SCENARIO.percentile },
        year: { type: "integer", values: [2030, 2050, 2080, 2100], default: DEFAULT_CUSTOM_SCENARIO.year },
      },
      example:
        "/api/v1/risk?lat=46.8&lng=-71.2&scenario=custom&timescale=3&rcp=8.5&percentile=25&year=2100",
    },
  });
}
