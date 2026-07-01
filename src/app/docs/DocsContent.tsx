"use client";

import { ContentShell } from "@/components/layout/ContentShell";

export function DocsContent({ baseUrl }: { baseUrl: string }) {
  return (
    <ContentShell>
      <div className="mb-10">
        <p className="text-overline text-accent mb-2">LAPARA IRHT Platform</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
          API Documentation
        </h1>
        <p className="text-slate-500 text-lg">Version 1.0 — REST endpoints for IRHT, drought, and risk data</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="content-section-title">Overview</h2>
          <p className="text-slate-600 leading-relaxed">
            The public REST API provides programmatic access to the Territorial Hydric
            Resilience Index (IRHT), composite drought scores, investment risk assessments,
            and climate scenario metadata. All v1 responses are wrapped in a versioned
            envelope:{" "}
            <code className="text-sm bg-slate-200/80 px-1.5 py-0.5 rounded-md font-mono">{`{ "version": "1.0", "data": … }`}</code>.
          </p>
        </section>

        <section>
          <h2 className="content-section-title">Endpoints</h2>

          <Endpoint
            method="GET"
            path="/api/v1/irht"
            description="Full IRHT score with C/H/G/T/D/E component breakdown and scenario projection."
            params={[
              { name: "lat", required: true, desc: "Latitude (WGS84)" },
              { name: "lng", required: true, desc: "Longitude (WGS84)" },
              { name: "depth", desc: "Well depth in metres (optional)" },
              { name: "yield", desc: "Well yield in L/min (optional)" },
              { name: "scenario", desc: "Climate scenario ID (default: current)" },
              { name: "locale", desc: "en or fr (default: en)" },
              { name: "watershed", desc: "JSON-encoded ZGIEBV watershed properties (optional)" },
            ]}
            example={`${baseUrl}/api/v1/irht?lat=45.45&lng=-72.92&scenario=2050-rcp85`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/drought"
            description="IRHT drought score at a geographic point (includes legacy composite field)."
            params={[
              { name: "lat", required: true, desc: "Latitude (WGS84)" },
              { name: "lng", required: true, desc: "Longitude (WGS84)" },
              { name: "depth", desc: "Well depth in metres (optional)" },
              { name: "yield", desc: "Well yield in L/min (optional)" },
              { name: "scenario", desc: "Climate scenario ID (default: current)" },
              { name: "locale", desc: "en or fr (default: en)" },
              { name: "watershed", desc: "JSON-encoded watershed properties (optional)" },
            ]}
            example={`${baseUrl}/api/v1/drought?lat=46.8&lng=-71.2&depth=45&yield=20&scenario=2050-rcp85`}
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
          <h2 className="content-section-title">Climate Scenarios</h2>
          <div className="content-card overflow-hidden !p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left bg-surface-muted">
                  <th className="py-3 px-4 font-semibold text-slate-700">ID</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Description</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-surface-border">
                  <td className="py-2.5 px-4 font-mono text-xs">current</td>
                  <td className="py-2.5 px-4">Observed historical conditions (AAFC SPI/SPEI)</td>
                </tr>
                <tr className="border-b border-surface-border">
                  <td className="py-2.5 px-4 font-mono text-xs">2050-rcp45</td>
                  <td className="py-2.5 px-4">Mid-century, moderate emissions (RCP 4.5)</td>
                </tr>
                <tr className="border-b border-surface-border">
                  <td className="py-2.5 px-4 font-mono text-xs">2050-rcp85</td>
                  <td className="py-2.5 px-4">Mid-century, high emissions (RCP 8.5)</td>
                </tr>
                <tr className="border-b border-surface-border">
                  <td className="py-2.5 px-4 font-mono text-xs">2100-rcp85</td>
                  <td className="py-2.5 px-4">End-of-century, high emissions (RCP 8.5)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono text-xs align-top">custom</td>
                  <td className="py-2.5 px-4">
                    Custom GeoMet SPEI projection. Add{" "}
                    <code className="text-xs bg-slate-200/80 px-1 rounded">timescale</code> (1|3|12),{" "}
                    <code className="text-xs bg-slate-200/80 px-1 rounded">rcp</code> (2.6|4.5|8.5),{" "}
                    <code className="text-xs bg-slate-200/80 px-1 rounded">percentile</code> (25|50|75),{" "}
                    <code className="text-xs bg-slate-200/80 px-1 rounded">year</code> (2030|2050|2080|2100).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Example:{" "}
            <code className="text-xs bg-slate-200/80 px-1.5 py-0.5 rounded break-all font-mono">
              {baseUrl}/api/v1/risk?lat=46.8&lng=-71.2&scenario=custom&timescale=12&rcp=2.6&percentile=75&year=2030
            </code>
          </p>
        </section>

        <section>
          <h2 className="content-section-title">Rate Limits &amp; Caching</h2>
          <p className="text-slate-600 leading-relaxed content-card">
            Responses are cached for up to 1 hour (<code className="text-sm bg-slate-200/80 px-1 rounded font-mono">s-maxage=3600</code>).
            No authentication is required for v1. Please use reasonable request rates
            when integrating into production systems.
          </p>
        </section>
      </div>

      <p className="text-caption text-slate-400 pt-6 mt-8 border-t border-surface-border">
        © {new Date().getFullYear()} Prosper Mapepa · Great Lakes Drought Index
      </p>
    </ContentShell>
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
    <div className="mb-6 content-card overflow-hidden !p-0">
      <div className="px-4 py-3 bg-surface-muted flex items-center gap-3 border-b border-surface-border">
        <span className="text-overline text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md normal-case">
          {method}
        </span>
        <code className="text-sm font-mono text-slate-800">{path}</code>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="text-slate-600 text-sm">{description}</p>
        {params.length > 0 && (
          <table className="w-full text-sm">
            <tbody>
              {params.map((p) => (
                <tr key={p.name} className="border-t border-surface-border">
                  <td className="py-2 pr-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                    {p.name}
                    {p.required && <span className="text-red-500 ml-0.5">*</span>}
                  </td>
                  <td className="py-2 text-slate-500">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div>
          <p className="text-overline text-slate-400 normal-case tracking-normal font-normal mb-1.5">Example</p>
          <code className="block text-xs bg-slate-900 text-emerald-300 p-3 rounded-lg overflow-x-auto font-mono">
            {example}
          </code>
        </div>
      </div>
    </div>
  );
}
