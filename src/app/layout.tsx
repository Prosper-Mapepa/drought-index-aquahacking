import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Great Lakes Drought Index | Indice de sécheresse Grands Lacs",
  description:
    "Operational drought index platform for Québec and the Great Lakes region. Plateforme opérationnelle d'indice de sécheresse pour le Québec et les Grands Lacs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
