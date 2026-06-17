import Link from "next/link";

export const metadata = {
  title: "API Documentation — Great Lakes Drought Index",
};

export default function DocsPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.URL ??
    "http://localhost:3000";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-sidebar text-white px-6 py-4 border-b border-sidebar-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">API Documentation</h1>
            <p className="text-sm text-white/60">Great Lakes Drought Index — v1.0</p>
          </div>
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            ← Back to map
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-3">Overview</h2>
          <p className="text-slate-600 leading-relaxed">
            The public REST API provides programmatic access to composite drought scores,
            investment risk assessments, and climate scenario metadata. All v1 responses
            are wrapped in a versioned envelope:{" "}
            <code className="text-sm bg-slate-200 px-1.5 py-0.5 rounded">{`{ "version": "1.0", "data": … }`}</code>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Endpoints</h2>

          <Endpoint
            method="GET"
            path="/api/v1/drought"
            description="Composite drought score at a geographic point."
            params={[
              { name: "lat", required: true, desc: "Latitude (WGS84)" },
              { name: "lng", required: true, desc: "Longitude (WGS84)" },
              { name: "depth", desc: "Well depth in metres (optional)" },
              { name: "yield", desc: "Well yield in L/min (optional)" },
              { name: "scenario", desc: "Climate scenario ID (default: current)" },
              { name: "locale", desc: "en or fr (default: en)" },
              { name: "w_spi, w_spei, w_gw, w_yield", desc: "Custom index weights (0–1, auto-normalized)" },
            ]}
            example={`${baseUrl}/api/v1/drought?lat=46.8&lng=-71.2&depth=45&yield=20&w_spi=0.4&w_gw=0.3`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/risk"
            description="Investment risk report for bankers and insurers."
            params={[
              { name: "lat", required: true, desc: "Latitude (WGS84)" },
              { name: "lng", required: true, desc: "Longitude (WGS84)" },
              { name: "scenario", desc: "Climate scenario ID (default: current)" },
              { name: "locale", desc: "en or fr (default: en)" },
              { name: "watershed", desc: "JSON-encoded ZGIEBV watershed properties (optional)" },
              { name: "w_spi, w_spei, w_gw, w_yield", desc: "Custom index weights" },
            ]}
            example={`${baseUrl}/api/v1/risk?lat=46.8&lng=-71.2&scenario=2050-rcp85`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/scenarios"
            description="List available climate scenarios."
            params={[]}
            example={`${baseUrl}/api/v1/scenarios`}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Climate Scenarios</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4 font-medium">ID</th>
                <th className="py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-mono text-xs">current</td>
                <td className="py-2">Observed historical conditions (AAFC SPI/SPEI)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-mono text-xs">2050-rcp45</td>
                <td className="py-2">Mid-century, moderate emissions (RCP 4.5)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-mono text-xs">2050-rcp85</td>
                <td className="py-2">Mid-century, high emissions (RCP 8.5)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">2100-rcp85</td>
                <td className="py-2">End-of-century, high emissions (RCP 8.5)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Rate Limits &amp; Caching</h2>
          <p className="text-slate-600 leading-relaxed">
            Responses are cached for up to 1 hour (<code className="text-sm bg-slate-200 px-1 rounded">s-maxage=3600</code>).
            No authentication is required for v1. Please use reasonable request rates
            when integrating into production systems.
          </p>
        </section>
      </main>
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
  params,
  example,
}: {
  method: string;
  path: string;
  description: string;
  params: { name: string; required?: boolean; desc: string }[];
  example: string;
}) {
  return (
    <div className="mb-8 border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="px-4 py-3 bg-slate-100 flex items-center gap-3">
        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
          {method}
        </span>
        <code className="text-sm font-mono">{path}</code>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="text-slate-600 text-sm">{description}</p>
        {params.length > 0 && (
          <table className="w-full text-sm">
            <tbody>
              {params.map((p) => (
                <tr key={p.name} className="border-t border-slate-100">
                  <td className="py-1.5 pr-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                    {p.name}
                    {p.required && <span className="text-red-500 ml-0.5">*</span>}
                  </td>
                  <td className="py-1.5 text-slate-500">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div>
          <p className="text-xs text-slate-400 mb-1">Example</p>
          <code className="block text-xs bg-slate-900 text-emerald-300 p-3 rounded overflow-x-auto">
            {example}
          </code>
        </div>
      </div>
    </div>
  );
}
