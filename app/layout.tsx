import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { getCompany } from "@/lib/queries";
import "./globals.css";

// Nearly every page reads content (Company, Services, ...) straight from
// Postgres via Server Components. Forcing dynamic rendering means pages
// always reflect the current database state — important once the Phase 2
// admin CMS can edit that content — and it means `next build` never needs
// a live database connection (it would otherwise try to statically
// pre-render these pages at build time, which breaks a from-scratch
// `docker build` where the DB container isn't reachable during the build).
export const dynamic = "force-dynamic";

const heading = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: company.seoTitle ?? `${company.legalName}`,
      template: `%s | ${company.name}`,
    },
    description: company.seoDescription ?? company.description,
    icons: {
      icon: company.faviconUrl ?? "/brand/icon.png",
    },
    openGraph: {
      title: company.seoTitle ?? company.legalName,
      description: company.seoDescription ?? company.description,
      siteName: company.name,
      locale: "en_TZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: company.seoTitle ?? company.legalName,
      description: company.seoDescription ?? company.description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
