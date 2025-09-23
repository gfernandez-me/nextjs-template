import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UploadDataAccess } from "@/app/(dashboard)/upload/data/upload";
import { type FribbelsExport } from "@/lib/validation/uploadSchemas";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get current user using Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
    const uploadDal = new UploadDataAccess(session.user.id);
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
