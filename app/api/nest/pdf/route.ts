import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Streams the NeST certificate through our own origin so it can be embedded
// in an <iframe> on /nest — the file itself may live on Vercel Blob (a
// different origin), which the site's CSP `frame-src` intentionally doesn't
// allow embedding directly.
export async function GET(request: NextRequest) {
  const profile = await prisma.nestProfile.findFirst();
  if (!profile?.pdfUrl) {
    return NextResponse.json({ error: "No PDF uploaded." }, { status: 404 });
  }

  const source = await fetch(new URL(profile.pdfUrl, request.url));
  if (!source.ok || !source.body) {
    return NextResponse.json({ error: "Could not load the PDF." }, { status: 502 });
  }

  return new NextResponse(source.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${profile.pdfName ?? "nest-business-lines.pdf"}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
