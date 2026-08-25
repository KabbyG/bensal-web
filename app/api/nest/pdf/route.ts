import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
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

  // Content-addressed on the current pdfUrl + when it was last saved, so a
  // re-upload (which always gets a new pdfUrl) is never served stale from
  // this fixed /api/nest/pdf path.
  const etag = `"${profile.id}-${profile.updatedAt.getTime()}"`;
  const cacheControl = "public, max-age=60, must-revalidate";
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag, "Cache-Control": cacheControl } });
  }

  let buffer: Buffer;
  if (profile.pdfUrl.startsWith("/")) {
    // Local disk (public/uploads/...) — read directly instead of an HTTP
    // loopback to our own server.
    buffer = await readFile(path.join(process.cwd(), "public", profile.pdfUrl));
  } else {
    const source = await fetch(profile.pdfUrl);
    if (!source.ok) {
      return NextResponse.json({ error: "Could not load the PDF." }, { status: 502 });
    }
    buffer = Buffer.from(await source.arrayBuffer());
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${profile.pdfName ?? "nest-business-lines.pdf"}"`,
      "Cache-Control": cacheControl,
      ETag: etag,
    },
  });
}
