import { GEAR_SETS } from "@/lib/gear-sets";

export function piecesFor(setName: string): number {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (GEAR_SETS as any)[setName]?.pieces ?? 2;
  } catch {
    return 2;
  }
}

export function shouldShowThird(setA: string, setB: string): boolean {
  const a4 = piecesFor(setA) === 4;
  const b4 = piecesFor(setB) === 4;
  return !(a4 || b4);
}

export function totalPieces(
  setA: string,
  setB: string,
  setC: string,
  useThird: boolean
): number {
  const a = setA ? piecesFor(setA) : 0;
  const b = setB ? piecesFor(setB) : 0;
  const c = useThird && setC ? piecesFor(setC) : 0;
  return a + b + c;
}

export function buildPlanFromSelectors(
  setA: string,
  setB: string,
  setC: string,
  useThird: boolean
) {
  const plan: Array<{ set: string; pieces: number }> = [];
  if (setA) plan.push({ set: setA, pieces: piecesFor(setA) });
  if (setB) plan.push({ set: setB, pieces: piecesFor(setB) });
  if (useThird && setC) plan.push({ set: setC, pieces: piecesFor(setC) });
  return plan;
}
