import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { createDataAccess } from "@/lib/data-access";
import { db } from "@/lib/db";
import type { MainStatType } from "#prisma";

export async function GET() {
  const session = await getAuth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dal = createDataAccess(session.user.id);
  const rows = await dal.listGearPriorities();
  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
  const session = await getAuth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dal = createDataAccess(session.user.id);
  const body = (await req.json()) as Partial<{
    name: string;
    gearType?: string | null;
    gearSetIds: number[] | null;
    mainStatTypes: (MainStatType | string)[] | null;
    prioritySub1Id: number | null;
    prioritySub2Id: number | null;
    prioritySub3Id: number | null;
    prioritySub4Id: number | null;
    heroIngameId: bigint | null | string | number;
    heroName: string | null;
    isActive: boolean;
  }>;

  if (!body?.name || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const setIds = (body.gearSetIds ?? []).filter(
    (n): n is number => typeof n === "number"
  );
  const mainTypes = (body.mainStatTypes ?? []).map((t) => t as MainStatType);
  const combos: Array<{
    gearSetId: number | null;
    mainStatType: MainStatType | null;
  }> = [];
  if (setIds.length && mainTypes.length) {
    for (const s of setIds)
      for (const m of mainTypes) combos.push({ gearSetId: s, mainStatType: m });
  } else if (setIds.length) {
    for (const s of setIds) combos.push({ gearSetId: s, mainStatType: null });
  } else if (mainTypes.length) {
    for (const m of mainTypes)
      combos.push({ gearSetId: null, mainStatType: m });
  } else {
    combos.push({ gearSetId: null, mainStatType: null });
  }

  const results = [] as unknown[];
  for (const combo of combos) {
    const created = await dal.createGearPriority({
      name: body.name.trim(),
      gearType:
        (body.gearType as
          | "weapon"
          | "armor"
          | "helm"
          | "neck"
          | "ring"
          | "boot"
          | null) || null,
      gearSetId: combo.gearSetId,
      mainStatType: combo.mainStatType,
      prioritySub1Id: body.prioritySub1Id ?? null,
      prioritySub2Id: body.prioritySub2Id ?? null,
      prioritySub3Id: body.prioritySub3Id ?? null,
      prioritySub4Id: body.prioritySub4Id ?? null,
      heroIngameId:
        body.heroIngameId !== undefined && body.heroIngameId !== null
          ? BigInt(
              typeof body.heroIngameId === "string" ||
                typeof body.heroIngameId === "number"
                ? (body.heroIngameId as string | number)
                : (body.heroIngameId as unknown as string)
            )
          : null,
      heroName: body.heroName?.trim() || null,
      isActive: body.isActive ?? true,
    });
    results.push(created);
  }
  // Link optional multiple heroes if provided in request as array heroIngameIds
  const raw = (
    body as unknown as { heroIngameIds?: Array<string | number | bigint> }
  ).heroIngameIds;
  const heroIds = Array.isArray(raw)
    ? raw
        .map((h) =>
          typeof h === "string" || typeof h === "number"
            ? BigInt(h)
            : (h as bigint)
        )
        .filter(Boolean)
    : [];
  if (heroIds.length) {
    for (const r of results as Array<{ id: number }>) {
      for (const h of heroIds) {
        await db.gearPriorityHeroes.upsert({
          where: {
            gearPriorityId_heroIngameId: {
              gearPriorityId: r.id,
              heroIngameId: h,
            },
          },
          create: { gearPriorityId: r.id, heroIngameId: h },
          update: {},
        });
      }
    }
  }
  return NextResponse.json({ created: results }, { status: 201 });
}
