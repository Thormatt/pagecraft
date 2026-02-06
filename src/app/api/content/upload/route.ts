/**
 * Content Upload API
 *
 * POST /api/content/upload
 *
 * Uploads a file, extracts text content, and saves to database
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processFile, getContentType } from "@/lib/content/processor";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
  "text/markdown",
];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 10MB limit" },
      { status: 400 }
    );
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 400 }
    );
  }

  const contentType = getContentType(file.type);
  if (!contentType) {
    return NextResponse.json(
      { error: "Could not determine content type" },
      { status: 400 }
    );
  }

  try {
    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process file and extract content
    const processed = await processFile(buffer, file.type);

    if (!processed) {
      return NextResponse.json(
        { error: "Failed to process file" },
        { status: 500 }
      );
    }

    // Save to database
    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        content: processed.content,
        content_type: processed.contentType,
      })
      .select()
      .single();

    if (error) {
      console.error("[Content Upload] Database error:", error);
      return NextResponse.json(
        { error: "Failed to save document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        content_type: document.content_type,
        file_size: document.file_size,
        created_at: document.created_at,
        // Include preview of content (first 500 chars)
        content_preview: document.content.slice(0, 500),
      },
    });
  } catch (error) {
    console.error("[Content Upload] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 }
    );
  }
}
