/**
 * Content Processor
 *
 * Extracts text content from various file types (PDF, DOCX, XLSX, CSV, TXT)
 */

import * as XLSX from "xlsx";

export type ContentType = "pdf" | "docx" | "xlsx" | "csv" | "txt";

export interface ProcessedContent {
  content: string;
  contentType: ContentType;
}

const MAX_CONTENT_LENGTH = 100000; // 100k chars max to avoid token limits

/**
 * Determine content type from MIME type
 */
export function getContentType(mimeType: string): ContentType | null {
  const mimeMap: Record<string, ContentType> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/msword": "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-excel": "xlsx",
    "text/csv": "csv",
    "text/plain": "txt",
    "text/markdown": "txt",
  };

  return mimeMap[mimeType] || null;
}

/**
 * Process PDF file and extract text
 */
async function processPdf(buffer: Buffer): Promise<string> {
  // Dynamic import for ESM module
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text.slice(0, MAX_CONTENT_LENGTH);
}

/**
 * Process DOCX file and extract text
 */
async function processDocx(buffer: Buffer): Promise<string> {
  // Dynamic import for CommonJS module compatibility
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.slice(0, MAX_CONTENT_LENGTH);
}

/**
 * Process Excel/CSV file and extract as formatted text
 */
function processSpreadsheet(
  buffer: Buffer,
  contentType: "xlsx" | "csv"
): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const lines: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    if (workbook.SheetNames.length > 1) {
      lines.push(`## Sheet: ${sheetName}\n`);
    }

    // Convert to array of arrays
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Format as markdown table
    if (data.length > 0) {
      const headers = (data[0] as (string | number | boolean | null)[]).map(
        (h) => String(h ?? "")
      );
      lines.push(`| ${headers.join(" | ")} |`);
      lines.push(`| ${headers.map(() => "---").join(" | ")} |`);

      for (let i = 1; i < Math.min(data.length, 500); i++) {
        const row = (data[i] as (string | number | boolean | null)[]).map((c) =>
          String(c ?? "")
        );
        lines.push(`| ${row.join(" | ")} |`);
      }

      if (data.length > 500) {
        lines.push(`\n... (${data.length - 500} more rows truncated)`);
      }
    }

    lines.push("");
  }

  return lines.join("\n").slice(0, MAX_CONTENT_LENGTH);
}

/**
 * Process plain text file
 */
function processText(buffer: Buffer): string {
  return buffer.toString("utf-8").slice(0, MAX_CONTENT_LENGTH);
}

/**
 * Process a file and extract its text content
 */
export async function processFile(
  buffer: Buffer,
  mimeType: string
): Promise<ProcessedContent | null> {
  const contentType = getContentType(mimeType);
  if (!contentType) return null;

  let content: string;

  switch (contentType) {
    case "pdf":
      content = await processPdf(buffer);
      break;
    case "docx":
      content = await processDocx(buffer);
      break;
    case "xlsx":
    case "csv":
      content = processSpreadsheet(buffer, contentType);
      break;
    case "txt":
      content = processText(buffer);
      break;
    default:
      return null;
  }

  return { content, contentType };
}

/**
 * Format documents for inclusion in AI context
 */
export function formatDocumentsForContext(
  documents: Array<{ filename: string; content: string }>
): string {
  if (documents.length === 0) return "";

  const parts = ["## Attached Documents\n"];

  for (const doc of documents) {
    parts.push(`### ${doc.filename}\n`);
    parts.push(doc.content);
    parts.push("\n---\n");
  }

  return parts.join("\n");
}
