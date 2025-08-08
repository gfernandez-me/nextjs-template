// Utilities to convert Prisma Decimal-like values to numbers recursively
// Use cautiously: you may lose precision for very large decimals, but our stat values are small

export type Primitive =
  | string
  | number
  | boolean
  | null
  | undefined
  | bigint
  | symbol;

export function isDecimalLike(
  value: unknown
): value is { toNumber: () => number } {
  return (
    typeof value === "object" &&
    value !== null &&
    // Prisma Decimal comes from decimal.js; methods are usually on the prototype.
    // We only need to check that a callable toNumber exists anywhere on the object.
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  );
}

export function convertDecimals<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((v) => convertDecimals(v)) as unknown as T;
  }
  if (typeof input === "bigint") {
    // Serialize bigint as string for client components compatibility
    return input.toString() as unknown as T;
  }
  if (isDecimalLike(input)) {
    return input.toNumber() as unknown as T;
  }
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = convertDecimals(v);
    }
    return out as T;
  }
  return input;
}
