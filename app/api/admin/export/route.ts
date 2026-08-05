import { NextResponse, type NextRequest } from "next/server";
import { getEntityConfig } from "@/lib/admin/entity-registry";
import { toCsv, toExcelBuffer, toPdfBuffer, contentTypeFor } from "@/lib/admin/export";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const entityKey = searchParams.get("entity") ?? "";
  const format = searchParams.get("format") ?? "csv";

  const config = getEntityConfig(entityKey);
  if (!config) {
    return NextResponse.json({ error: `Unknown entity "${entityKey}"` }, { status: 400 });
  }
  if (!["csv", "xlsx", "pdf"].includes(format)) {
    return NextResponse.json({ error: `Unsupported format "${format}"` }, { status: 400 });
  }

  const rows = await config.listNonDeleted();
  const filename = `${config.key}-${new Date().toISOString().slice(0, 10)}.${format}`;
  const headers = {
    "Content-Type": contentTypeFor(format as "csv" | "xlsx" | "pdf"),
    "Content-Disposition": `attachment; filename="${filename}"`,
  };

  if (format === "csv") {
    const csv = toCsv(rows, config.exportColumns);
    return new NextResponse(csv, { headers });
  }
  if (format === "xlsx") {
    const buffer = await toExcelBuffer(rows, config.exportColumns, config.label);
    return new NextResponse(new Uint8Array(buffer), { headers });
  }
  const buffer = await toPdfBuffer(rows, config.exportColumns, config.label);
  return new NextResponse(new Uint8Array(buffer), { headers });
}
