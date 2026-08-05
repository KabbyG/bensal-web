import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export type ExportColumn<T> = {
  header: string;
  value: (row: T) => string;
};

function cellValue<T>(row: T, col: ExportColumn<T>) {
  try {
    return col.value(row) ?? "";
  } catch {
    return "";
  }
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const header = columns.map((c) => csvEscape(c.header)).join(",");
  const lines = rows.map((row) =>
    columns.map((col) => csvEscape(cellValue(row, col))).join(",")
  );
  return [header, ...lines].join("\r\n");
}

export async function toExcelBuffer<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  sheetName: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31) || "Sheet1");
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.header, width: 24 }));
  sheet.getRow(1).font = { bold: true };
  for (const row of rows) {
    sheet.addRow(columns.map((col) => cellValue(row, col)));
  }
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export async function toPdfBuffer<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  title: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text(title, { align: "left" });
    doc.moveDown(0.5);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = pageWidth / columns.length;
    const rowHeight = 20;

    function truncate(text: string, width: number) {
      let result = text;
      while (result.length > 0 && doc.widthOfString(result) > width - 6) {
        result = result.slice(0, -1);
      }
      return result.length < text.length ? `${result.slice(0, -1)}…` : result;
    }

    function drawRow(values: string[], y: number, bold: boolean) {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9);
      values.forEach((value, i) => {
        doc.text(truncate(value, colWidth), doc.page.margins.left + i * colWidth, y, {
          width: colWidth,
          height: rowHeight,
        });
      });
    }

    let y = doc.y;
    drawRow(columns.map((c) => c.header), y, true);
    y += rowHeight;
    doc
      .moveTo(doc.page.margins.left, y - 4)
      .lineTo(doc.page.width - doc.page.margins.right, y - 4)
      .strokeColor("#cccccc")
      .stroke();

    for (const row of rows) {
      if (y > doc.page.height - doc.page.margins.bottom - rowHeight) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      drawRow(
        columns.map((col) => cellValue(row, col)),
        y,
        false
      );
      y += rowHeight;
    }

    doc.end();
  });
}

export function contentTypeFor(format: "csv" | "xlsx" | "pdf") {
  switch (format) {
    case "csv":
      return "text/csv; charset=utf-8";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "pdf":
      return "application/pdf";
  }
}
