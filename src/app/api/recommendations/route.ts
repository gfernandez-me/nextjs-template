import { type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { GearType, MainStatType } from "#prisma";

// Validation schema for the request body
const createRecommendationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  heroIngameIds: z.array(z.string()),
  items: z.array(
    z.object({
      type: z.nativeEnum(GearType),
      mainStatType: z.nativeEnum(MainStatType),
      setIds: z.array(z.number()),
    })
  ),
  isActive: z.boolean(),
});

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createRecommendationSchema.parse(body);

    // Create the recommendation
    const recommendation = await prisma.gearRecommendation.create({
      data: {
        name: data.name,
        userId: session.user.id,
      },
    });

    return Response.json({ id: recommendation.id });
  } catch (error) {
    console.error("Failed to create recommendation:", error);
    return new Response(
      error instanceof z.ZodError
        ? JSON.stringify(error.errors)
        : "Internal Server Error",
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}
