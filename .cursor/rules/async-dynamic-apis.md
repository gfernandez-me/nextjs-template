# Async Dynamic APIs (Next.js 15)

## Rules

1. In Server Components and route handlers, `searchParams` and `params` are Promises and must be awaited before reading properties:

```typescript
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams; // ✅ await before use
  // Now you can use sp safely
}
```

2. Never call Object.keys/entries/values directly on the Promise:

```typescript
// ❌ Don't do this
Object.entries(searchParams);

// ✅ Do this instead
const sp = await searchParams;
Object.entries(sp);
```

3. `cookies()` and `headers()` are async → always await them:

```typescript
const headers = await headers();
const cookies = await cookies();
```

4. Client Components keep using `useSearchParams()` from next/navigation.

## Patterns

### Server Components

```typescript
// Page components
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // Use sp
}

// Layout components
export default async function Layout({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const p = await params;
  // Use p
}
```

### Route Handlers

```typescript
export async function GET(request: NextRequest) {
  const searchParams = await request.nextUrl.searchParams;
  // Use searchParams
}
```

## References

- [Next.js Sync Dynamic APIs Message](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Next.js Page Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/page)
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
