import { DocsContent } from "./DocsContent";

export const metadata = {
  title: "API Documentation — LAPARA IRHT Platform",
};

export default function DocsPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.URL ??
    "http://localhost:3000";

  return <DocsContent baseUrl={baseUrl} />;
}
