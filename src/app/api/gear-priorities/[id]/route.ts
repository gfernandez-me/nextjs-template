import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { createDataAccess } from "@/lib/data-access";
import type { MainStatType } from "#prisma";

export async function PUT(req: Request) {
  const session = await getAuth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dal = createDataAccess(session.user.id);
  const { pathname } = new URL(req.url);
  const idStr = pathname.split("/").pop() || "";
  const id = Number(idStr);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = (await req.json()) as Partial<{
    name: string;
    gearType?: string | null;
    gearSetId: number | null;
    mainStatType: MainStatType | null | string;
    prioritySub1Id: number | null;
    prioritySub2Id: number | null;
    prioritySub3Id: number | null;
    prioritySub4Id: number | null;
    heroIngameId: bigint | null | string | number;
    heroName: string | null;
    isActive: boolean;
  }>;
  const updated = await dal.updateGearPriority(id, {
    ...body,
    gearType:
      (body.gearType as
        | "weapon"
        | "armor"
        | "helm"
        | "neck"
        | "ring"
        | "boot"
        | null) || null,
    mainStatType: (body.mainStatType ?? null) as MainStatType | null,
    heroIngameId:
      body.heroIngameId !== undefined && body.heroIngameId !== null
        ? BigInt(
            typeof body.heroIngameId === "string" ||
              typeof body.heroIngameId === "number"
              ? (body.heroIngameId as string | number)
              : (body.heroIngameId as unknown as string)
          )
        : null,
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await getAuth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dal = createDataAccess(session.user.id);
  const { pathname } = new URL(req.url);
  const idStr = pathname.split("/").pop() || "";
  const id = Number(idStr);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await dal.deleteGearPriority(id);
  return NextResponse.json({ ok: true });
}
