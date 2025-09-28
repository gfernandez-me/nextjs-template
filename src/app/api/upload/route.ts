import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUserId } from "@/lib/auth-utils";
import { UploadDataAccess } from "@/lib/dal/upload";
import { type FribbelsExport } from "@/lib/validation/uploadSchemas";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get current user using centralized auth utility
    const session = await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".txt")) {
      return NextResponse.json(
        { message: "Only .txt files are supported" },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    let data: FribbelsExport;

    try {
      data = JSON.parse(fileContent);
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON file" },
        { status: 400 }
      );
    }

    if (!data || !data.items || !Array.isArray(data.items)) {
      return NextResponse.json(
        { message: "Invalid file format. Expected 'items' array." },
        { status: 400 }
      );
    }

    // Use the data access layer to process the upload
    const uploadDal = new UploadDataAccess(getUserId(session));
    const result = await uploadDal.processFribbelsExport(data);

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        count: result.count,
        gearCount: result.gearCount,
        heroCount: result.heroCount,
        durationMs: result.durationMs,
        errors: result.errors,
      });
    } else {
      return NextResponse.json(
        { message: result.message, errors: result.errors },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
