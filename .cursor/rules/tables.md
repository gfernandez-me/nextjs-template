# Tables: Server-Side Patterns & URL-Driven State

## Core Principles

- **Server is the source of truth** for filter/sort/page state
- **Encode state in URL**; page back/forward works
- **TanStack in manual mode** for server-side tables; never loop-fetch in useEffect
- **Keep client components presentational/interactive only**

## Reference Documentation

- [TanStack Table filtering & server-side patterns (v8 docs)](https://tanstack.com/table/v8/docs/guide/column-filtering)
- [Next.js Server Actions (2024–2025)](https://nextjs.org/docs/app/guides/forms)
- [React 19 `use` overview (2024)](https://dev.to/hreuven/react-19-new-features-the-use-hook-4e8b)

## Architecture Pattern

### 1. Server Component (Data Source)

```tsx
// app/gears/page.tsx (Server Component)
export default async function GearsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse URL parameters for server-side filtering
  const filters = parseSearchParams(searchParams);
  
  // Fetch data with filters applied server-side
  const gears = await getGearsWithFilters(filters);
  
  return (
    <div>
      <FilterBar />
      <GearTable gears={gears} />
    </div>
  );
}
```

### 2. Client Filter Component (URL Updates Only)

```tsx
// components/filters/GearFilters.tsx (Client Component)
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function GearFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const updateFilters = useCallback((newFilters: Partial<GearFilters>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      
      // Update URL parameters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "") {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });
      
      // Reset to first page when filters change
      params.delete("page");
      
      // Update URL (triggers server re-render)
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }, [searchParams, router, startTransition]);
  
  return (
    <div>
      <input
        defaultValue={searchParams.get("name") || ""}
        onChange={(e) => updateFilters({ name: e.target.value })}
        placeholder="Filter by name..."
      />
      {/* More filter controls */}
    </div>
  );
}
```

### 3. Client Table Component (Presentational Only)

```tsx
// components/GearTable.tsx (Client Component)
"use client";

import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";

export function GearTable({ gears }: { gears: Gear[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const table = useReactTable({
    data: gears, // Data comes from server, no fetching needed
    columns: gearColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Manual mode for server-side operations
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    // Current state from URL
    state: {
      sorting: parseSortingFromURL(searchParams),
      pagination: parsePaginationFromURL(searchParams),
    },
    // Update URL when user interacts
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater([]) : updater;
      updateURL({ sorting: newSorting });
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === "function" ? updater({ pageIndex: 0, pageSize: 10 }) : updater;
      updateURL({ pagination: newPagination });
    },
  });
  
  const updateURL = useCallback((updates: Partial<TableState>) => {
    const params = new URLSearchParams(searchParams);
    
    if (updates.sorting) {
      const sortString = updates.sorting
        .map(sort => `${sort.id}:${sort.desc ? "desc" : "asc"}`)
        .join(",");
      if (sortString) params.set("sort", sortString);
      else params.delete("sort");
    }
    
    if (updates.pagination) {
      params.set("page", String(updates.pagination.pageIndex + 1));
      params.set("size", String(updates.pagination.pageSize));
    }
    
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);
  
  return (
    <table>
      {/* Table rendering */}
    </table>
  );
}
```

## URL Parameter Management

### 1. Utility Functions

```tsx
// lib/url.ts
export function parseSearchParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get("page") || "1", 10),
    size: parseInt(searchParams.get("size") || "10", 10),
    sort: parseSorting(searchParams.get("sort") || ""),
    filters: parseFilters(searchParams),
  };
}

export function parseSorting(sortString: string) {
  if (!sortString) return [];
  
  return sortString.split(",").map(sort => {
    const [id, direction] = sort.split(":");
    return {
      id,
      desc: direction === "desc",
    };
  });
}

export function parseFilters(searchParams: URLSearchParams) {
  return {
    name: searchParams.get("name") || undefined,
    type: searchParams.get("type") || undefined,
    rank: searchParams.get("rank")?.split("|") || [],
    level: searchParams.get("level") ? parseInt(searchParams.get("level")!, 10) : undefined,
  };
}

export function buildSearchParams(updates: Partial<TableState>) {
  const params = new URLSearchParams();
  
  if (updates.page && updates.page > 1) {
    params.set("page", String(updates.page));
  }
  
  if (updates.size && updates.size !== 10) {
    params.set("size", String(updates.size));
  }
  
  if (updates.sort && updates.sort.length > 0) {
    const sortString = updates.sort
      .map(sort => `${sort.id}:${sort.desc ? "desc" : "asc"}`)
      .join(",");
    params.set("sort", sortString);
  }
  
  if (updates.filters) {
    Object.entries(updates.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join("|"));
          }
        } else {
          params.set(key, String(value));
        }
      }
    });
  }
  
  return params;
}
```

### 2. Debounced URL Updates

```tsx
// lib/url.ts
export function useDebouncedSearchParams(delay: number = 300) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const updateSearchParams = useCallback((updates: Partial<TableState>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const params = buildSearchParams(updates);
      router.replace(`?${params.toString()}`, { scroll: false });
    }, delay);
  }, [router, delay]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return updateSearchParams;
}
```

## TanStack Table Configuration

### 1. Manual Mode Setup

```tsx
// components/GearTable.tsx
const table = useReactTable({
  data: gears,
  columns: gearColumns,
  
  // Manual mode for server-side operations
  manualSorting: true,
  manualPagination: true,
  manualFiltering: true,
  
  // Row count for pagination
  pageCount: Math.ceil(totalCount / pageSize),
  
  // State from URL
  state: {
    sorting: currentSorting,
    pagination: currentPagination,
    columnFilters: currentFilters,
  },
  
  // Event handlers update URL
  onSortingChange: (updater) => {
    const newSorting = typeof updater === "function" ? updater(currentSorting) : updater;
    updateURL({ sorting: newSorting });
  },
  
  onPaginationChange: (updater) => {
    const newPagination = typeof updater === "function" ? updater(currentPagination) : updater;
    updateURL({ pagination: newPagination });
  },
  
  onColumnFiltersChange: (updater) => {
    const newFilters = typeof updater === "function" ? updater(currentFilters) : updater;
    updateURL({ filters: newFilters });
  },
});
```

### 2. Column Definitions

```tsx
// components/GearTable.tsx
const gearColumns: ColumnDef<Gear>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <GearNameCell gear={row.original} />,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <GearTypeCell type={row.original.type} />,
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => <GearLevelCell level={row.original.level} />,
  },
  {
    accessorKey: "enhance",
    header: "Enhance",
    cell: ({ row }) => <GearEnhanceCell enhance={row.original.enhance} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <GearActions gear={row.original} />,
    enableSorting: false,
    enableFiltering: false,
  },
];
```

## Server-Side Data Fetching

### 1. Data Access Layer

```tsx
// lib/data-access.ts
export async function getGearsWithFilters(filters: GearFilters) {
  const { page = 1, size = 10, sort = [], filters: filterParams } = filters;
  
  const where: Prisma.GearsWhereInput = {};
  
  // Apply filters
  if (filterParams.name) {
    where.name = { contains: filterParams.name, mode: "insensitive" };
  }
  
  if (filterParams.type && filterParams.type !== "All") {
    where.type = filterParams.type;
  }
  
  if (filterParams.rank && filterParams.rank.length > 0) {
    where.rank = { in: filterParams.rank };
  }
  
  if (filterParams.level) {
    where.level = filterParams.level;
  }
  
  // Build orderBy from sort
  const orderBy: Prisma.GearsOrderByWithRelationInput[] = sort.map(sortItem => ({
    [sortItem.id]: sortItem.desc ? "desc" : "asc",
  }));
  
  // Default sorting if none specified
  if (orderBy.length === 0) {
    orderBy.push({ createdAt: "desc" });
  }
  
  const [gears, totalCount] = await Promise.all([
    db.gears.findMany({
      where,
      orderBy,
      skip: (page - 1) * size,
      take: size,
      include: {
        Hero: true,
        GearSubStats: {
          include: { StatType: true },
        },
      },
    }),
    db.gears.count({ where }),
  ]);
  
  return {
    gears,
    totalCount,
    pageCount: Math.ceil(totalCount / size),
    currentPage: page,
    pageSize: size,
  };
}
```

### 2. Page Component

```tsx
// app/gears/page.tsx
export default async function GearsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const dal = createDataAccess(session.user.id);
  const filters = parseSearchParams(searchParams);
  const result = await dal.getGearsWithFilters(filters);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gears</h1>
        <p className="text-muted-foreground">
          View and manage your Epic 7 gear inventory.
        </p>
      </div>
      
      <GearFilters />
      <GearTable 
        gears={result.gears} 
        totalCount={result.totalCount}
        pageCount={result.pageCount}
        currentPage={result.currentPage}
        pageSize={result.pageSize}
      />
    </div>
  );
}
```

## Filter Component Patterns

### 1. Controlled Inputs with URL Sync

```tsx
// components/filters/GearFilters.tsx
export function GearFilters() {
  const searchParams = useSearchParams();
  const updateFilters = useDebouncedSearchParams();
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <Label htmlFor="name-filter">Name</Label>
          <Input
            id="name-filter"
            defaultValue={searchParams.get("name") || ""}
            onChange={(e) => updateFilters({ filters: { name: e.target.value } })}
            placeholder="Filter by name..."
          />
        </div>
        
        <div>
          <Label htmlFor="type-filter">Type</Label>
          <Select
            value={searchParams.get("type") || "All"}
            onValueChange={(value) => updateFilters({ filters: { type: value } })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="WEAPON">Weapon</SelectItem>
              <SelectItem value="ARMOR">Armor</SelectItem>
              {/* More options */}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex gap-2">
        {["Epic", "Heroic"].map((rank) => {
          const isActive = searchParams.get("rank")?.includes(rank) || false;
          
          return (
            <Button
              key={rank}
              variant={isActive ? "default" : "outline"}
              onClick={() => {
                const currentRanks = searchParams.get("rank")?.split("|") || [];
                const newRanks = isActive
                  ? currentRanks.filter(r => r !== rank)
                  : [...currentRanks, rank];
                
                updateFilters({ filters: { rank: newRanks } });
              }}
            >
              {rank}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
```

### 2. Range Filters

```tsx
// components/filters/RangeFilter.tsx
export function RangeFilter({
  label,
  paramName,
  min,
  max,
  step = 1,
}: {
  label: string;
  paramName: string;
  min: number;
  max: number;
  step?: number;
}) {
  const searchParams = useSearchParams();
  const updateFilters = useDebouncedSearchParams();
  
  const currentValue = searchParams.get(paramName);
  
  return (
    <div>
      <Label htmlFor={`${paramName}-filter`}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={`${paramName}-filter`}
          type="number"
          min={min}
          max={max}
          step={step}
          defaultValue={currentValue || ""}
          onChange={(e) => {
            const value = e.target.value;
            updateFilters({ 
              filters: { [paramName]: value ? parseInt(value, 10) : undefined } 
            });
          }}
          className="w-20"
        />
        <span className="text-sm text-muted-foreground">
          {min}-{max}
        </span>
      </div>
    </div>
  );
}
```

## Pagination Component

### 1. Server-Side Pagination

```tsx
// components/Pagination.tsx
export function Pagination({
  currentPage,
  pageCount,
  pageSize,
  totalCount,
}: {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const updatePage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);
  
  if (pageCount <= 1) return null;
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {((currentPage - 1) * pageSize) + 1} to{" "}
        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => updatePage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage >= pageCount}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

## Performance Optimizations

### 1. Debounced Filter Updates

```tsx
// Use debounced updates for text inputs
const debouncedUpdateFilters = useDebouncedSearchParams(300);

<input
  onChange={(e) => debouncedUpdateFilters({ filters: { name: e.target.value } })}
/>
```

### 2. Memoized Components

```tsx
// Memoize expensive filter components
const MemoizedGearFilters = memo(GearFilters);
const MemoizedGearTable = memo(GearTable);

// In page component
return (
  <div>
    <MemoizedGearFilters />
    <MemoizedGearTable gears={gears} />
  </div>
);
```

### 3. Optimistic Updates

```tsx
// Use optimistic updates for immediate feedback
const [optimisticFilters, setOptimisticFilters] = useState(filters);

const updateFiltersOptimistically = useCallback((newFilters) => {
  setOptimisticFilters(newFilters); // Immediate UI update
  
  // Debounced URL update
  debouncedUpdateFilters(newFilters);
}, [debouncedUpdateFilters]);
```

## Testing Patterns

### 1. Test URL Parameter Parsing

```tsx
// lib/__tests__/url.test.ts
describe("parseSearchParams", () => {
  it("parses pagination parameters", () => {
    const searchParams = new URLSearchParams("page=2&size=20");
    const result = parseSearchParams(searchParams);
    
    expect(result.page).toBe(2);
    expect(result.size).toBe(20);
  });
  
  it("parses sorting parameters", () => {
    const searchParams = new URLSearchParams("sort=name:asc,level:desc");
    const result = parseSearchParams(searchParams);
    
    expect(result.sort).toEqual([
      { id: "name", desc: false },
      { id: "level", desc: true },
    ]);
  });
});
```

### 2. Test Filter Component Behavior

```tsx
// components/__tests__/GearFilters.test.tsx
describe("GearFilters", () => {
  it("updates URL when filters change", async () => {
    const mockRouter = { replace: jest.fn() };
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue(mockRouter);
    
    render(<GearFilters />);
    
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: "sword" } });
    
    // Wait for debounced update
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining("name=sword"),
        expect.any(Object)
      );
    });
  });
});
```

## Common Pitfalls

### 1. Avoid Client-Side Fetching

```tsx
// ❌ BAD: Fetching in useEffect
useEffect(() => {
  fetchGears(filters).then(setGears);
}, [filters]); // ❌ Creates fetch loops

// ✅ GOOD: Data passed as props from server
function GearTable({ gears }: { gears: Gear[] }) {
  // No fetching needed
}
```

### 2. Avoid Complex State Synchronization

```tsx
// ❌ BAD: Complex state sync
const [localFilters, setLocalFilters] = useState(filters);
useEffect(() => {
  setLocalFilters(filters);
}, [filters]); // ❌ Prop-to-state sync

// ✅ GOOD: Use URL as source of truth
const searchParams = useSearchParams();
const currentFilters = parseSearchParams(searchParams);
```

### 3. Avoid Manual DOM Manipulation

```tsx
// ❌ BAD: Manual DOM updates
useEffect(() => {
  const table = document.querySelector("table");
  if (table) {
    table.style.width = "100%";
  }
}, []); // ❌ DOM manipulation in effect

// ✅ GOOD: CSS classes or callback refs
<div className="w-full">
  <table>...</table>
</div>
```

## Migration Checklist

- [ ] Convert data fetching from useEffect to Server Components
- [ ] Implement URL parameter parsing and building utilities
- [ ] Configure TanStack Table in manual mode
- [ ] Create filter components that update URL only
- [ ] Add pagination component with URL state
- [ ] Test URL-driven navigation and state persistence
- [ ] Verify no client-side data fetching loops
- [ ] Ensure proper loading states and error handling
- [ ] Test browser back/forward navigation
- [ ] Optimize with debouncing and memoization

