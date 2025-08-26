import { HeroElement, HeroClass } from "#prisma";
import prisma from "@/lib/prisma";
import { convertDecimals } from "@/lib/decimal";

export type HeroForRecommendation = {
  id: number;
  name: string;
  element: HeroElement | null;
  class: HeroClass | null;
};

export async function getHeroes(): Promise<HeroForRecommendation[]> {
  const heroes = await prisma.heroes.findMany({
    select: {
      id: true,
      name: true,
      element: true,
      class: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Return distinct heroes by name (keep the first occurrence)
  const distinctHeroes = heroes.filter(
    (hero, index, self) => index === self.findIndex((h) => h.name === hero.name)
  );

  return distinctHeroes;
}

export async function getStatTypes() {
  const statTypes = await prisma.statTypes.findMany({
    orderBy: {
      statName: "asc",
    },
  });

  return convertDecimals(statTypes);
}
