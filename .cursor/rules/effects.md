# useEffect: Modern Patterns & Anti-Patterns

## Core Principles (2024-2025)

- **No data fetching in `useEffect`**. Use Server Components, React 19 `use(promise)`, or URL-driven state
- **No effect for simple derivations**. Compute during render or memoize with `useMemo`
- **No effect for prop→state sync**. Make state controlled or derive on the fly
- **Effects only for real side-effects** (subscriptions, timers, focus, imperative APIs) with cleanup
- **Dependencies**: list all real deps; split unrelated concerns; no `async` directly on effect
- **Replace effect-based DOM reads with callback refs** when feasible

## Reference Documentation

- [React 19 `use` overview (2024)](https://dev.to/hreuven/react-19-new-features-the-use-hook-4e8b)
- [Next.js Server Actions (2024–2025)](https://nextjs.org/docs/app/guides/forms)
- [Modern "don't fetch in useEffect" discussions (2025+)](https://react.dev/learn/you-might-not-need-an-effect)

## Linter-Style Checklist

### ❌ NEVER Use useEffect For:

- [ ] Data fetching from APIs
- [ ] Prop-to-state synchronization
- [ ] Simple value derivations
- [ ] Event listener setup (use event handlers instead)
- [ ] DOM measurements (use callback refs)
- [ ] URL parameter reading (use searchParams)

### ✅ ONLY Use useEffect For:

- [ ] Subscriptions (WebSocket, event listeners)
- [ ] Timers and intervals
- [ ] Focus management
- [ ] Imperative API calls (third-party libraries)
- [ ] Cleanup operations

## Quick-Fix Recipes

### 1. Replace Data Fetching useEffect

```tsx
// ❌ OLD: useEffect for data fetching
function GearTable() {
  const [gears, setGears] = useState([]);
  
  useEffect(() => {
    fetch('/api/gears').then(res => res.json()).then(setGears);
  }, []); // ❌ Anti-pattern
  
  return <table>{/* render gears */}</table>;
}

// ✅ NEW: Server Component + URL-driven state
// app/gears/page.tsx (Server Component)
export default async function GearsPage({ searchParams }) {
  const gears = await getGears(searchParams); // Server-side fetch
  return <GearTable gears={gears} />;
}

// components/GearTable.tsx (Client Component)
export function GearTable({ gears }) {
  // gears passed as props, no fetching needed
  return <table>{/* render gears */}</table>;
}
```

### 2. Replace Prop-to-State useEffect

```tsx
// ❌ OLD: useEffect for prop sync
function GearForm({ initialGear }) {
  const [gear, setGear] = useState(initialGear);
  
  useEffect(() => {
    setGear(initialGear); // ❌ Anti-pattern
  }, [initialGear]);
  
  return <form>{/* form fields */}</form>;
}

// ✅ NEW: Controlled component or derived state
function GearForm({ initialGear }) {
  // Option 1: Controlled component
  const [gear, setGear] = useState(initialGear);
  
  // Option 2: Derived state (if initialGear never changes)
  const gear = useMemo(() => initialGear, [initialGear]);
  
  return <form>{/* form fields */}</form>;
}
```

### 3. Replace Simple Derivation useEffect

```tsx
// ❌ OLD: useEffect for simple calculation
function GearStats({ gears }) {
  const [totalValue, setTotalValue] = useState(0);
  
  useEffect(() => {
    const total = gears.reduce((sum, gear) => sum + gear.value, 0);
    setTotalValue(total); // ❌ Anti-pattern
  }, [gears]);
  
  return <div>Total Value: {totalValue}</div>;
}

// ✅ NEW: Compute during render or memoize
function GearStats({ gears }) {
  // Option 1: Compute during render (simple cases)
  const totalValue = gears.reduce((sum, gear) => sum + gear.value, 0);
  
  // Option 2: Memoize for expensive calculations
  const totalValue = useMemo(() => 
    gears.reduce((sum, gear) => sum + gear.value, 0), 
    [gears]
  );
  
  return <div>Total Value: {totalValue}</div>;
}
```

### 4. Replace DOM Reading useEffect

```tsx
// ❌ OLD: useEffect for DOM measurements
function ResizableComponent() {
  const [width, setWidth] = useState(0);
  const ref = useRef();
  
  useEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        setWidth(ref.current.offsetWidth); // ❌ Anti-pattern
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  return <div ref={ref}>Width: {width}</div>;
}

// ✅ NEW: Callback ref + ResizeObserver
function ResizableComponent() {
  const [width, setWidth] = useState(0);
  
  const ref = useCallback((node) => {
    if (node) {
      const observer = new ResizeObserver((entries) => {
        setWidth(entries[0].contentRect.width);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, []);
  
  return <div ref={ref}>Width: {width}</div>;
}
```

## Modern Alternatives

### 1. Server Components for Data Fetching

```tsx
// ✅ Server Component handles data fetching
export default async function GearsPage({ searchParams }) {
  const filters = parseFilters(searchParams);
  const gears = await getGearsWithFilters(filters);
  
  return (
    <div>
      <FilterBar />
      <GearTable gears={gears} />
    </div>
  );
}
```

### 2. React 19 `use()` Hook

```tsx
// ✅ React 19 use() for async data in components
function GearDetails({ gearPromise }) {
  const gear = use(gearPromise); // Suspense-compatible
  
  return (
    <div>
      <h1>{gear.name}</h1>
      <p>Level: {gear.level}</p>
    </div>
  );
}
```

### 3. URL-Driven State

```tsx
// ✅ URL as source of truth
function GearFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const updateFilters = useCallback((newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);
  
  return (
    <div>
      <input 
        defaultValue={searchParams.get('name') || ''}
        onChange={(e) => updateFilters({ name: e.target.value })}
      />
    </div>
  );
}
```

### 4. Event Handlers Instead of useEffect

```tsx
// ❌ OLD: useEffect for event handling
function SearchInput() {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const handleSearch = () => {
      // Search logic
    };
    
    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]); // ❌ Complex effect for simple debouncing
  
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// ✅ NEW: Event handler with debouncing
function SearchInput() {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef();
  
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Search logic
    }, 300);
  }, []);
  
  return <input value={query} onChange={handleChange} />;
}
```

## Proper useEffect Usage

### 1. Subscriptions

```tsx
function WebSocketComponent() {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onmessage = (event) => {
      // Handle message
    };
    
    return () => {
      ws.close(); // ✅ Proper cleanup
    };
  }, []); // ✅ Empty deps for setup/cleanup only
}
```

### 2. Timers

```tsx
function TimerComponent() {
  useEffect(() => {
    const interval = setInterval(() => {
      // Timer logic
    }, 1000);
    
    return () => clearInterval(interval); // ✅ Proper cleanup
  }, []); // ✅ Empty deps for setup/cleanup only
}
```

### 3. Focus Management

```tsx
function AutoFocusInput() {
  const inputRef = useRef();
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // ✅ Imperative API call
    }
  }, []); // ✅ Empty deps for setup only
  
  return <input ref={inputRef} />;
}
```

### 4. Third-Party Library Integration

```tsx
function ChartComponent({ data }) {
  const chartRef = useRef();
  
  useEffect(() => {
    if (chartRef.current && data) {
      const chart = new ThirdPartyChart(chartRef.current, data);
      
      return () => {
        chart.destroy(); // ✅ Proper cleanup
      };
    }
  }, [data]); // ✅ Only re-run when data changes
  
  return <div ref={chartRef} />;
}
```

## Dependency Array Rules

### 1. Include All Dependencies

```tsx
// ❌ BAD: Missing dependencies
useEffect(() => {
  fetchGears(userId, filters); // userId and filters are dependencies
}, [userId]); // ❌ Missing filters

// ✅ GOOD: All dependencies included
useEffect(() => {
  fetchGears(userId, filters);
}, [userId, filters]); // ✅ All dependencies listed
```

### 2. Split Unrelated Effects

```tsx
// ❌ BAD: Multiple concerns in one effect
useEffect(() => {
  // User data fetching
  fetchUser(userId);
  
  // Analytics tracking
  trackPageView(pageName);
  
  // Theme setup
  setupTheme(theme);
}, [userId, pageName, theme]); // ❌ Mixed concerns

// ✅ GOOD: Separate effects for separate concerns
useEffect(() => {
  fetchUser(userId);
}, [userId]);

useEffect(() => {
  trackPageView(pageName);
}, [pageName]);

useEffect(() => {
  setupTheme(theme);
}, [theme]);
```

### 3. No Async in useEffect

```tsx
// ❌ BAD: Async function directly in useEffect
useEffect(async () => {
  const data = await fetchData(); // ❌ Can't use async directly
  setData(data);
}, []);

// ✅ GOOD: Define async function inside effect
useEffect(() => {
  const fetchDataAsync = async () => {
    const data = await fetchData();
    setData(data);
  };
  
  fetchDataAsync();
}, []);
```

### 4. Use AbortController for Fetch

```tsx
// ✅ GOOD: Proper cleanup with AbortController
useEffect(() => {
  const abortController = new AbortController();
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', {
        signal: abortController.signal,
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    }
  };
  
  fetchData();
  
  return () => {
    abortController.abort(); // ✅ Cancel pending requests
  };
}, []);
```

## Migration Strategy

### Phase 1: Identify Anti-Patterns
1. Search for `useEffect(` in codebase
2. Categorize by purpose (data fetching, prop sync, etc.)
3. Mark for refactoring

### Phase 2: Replace Data Fetching
1. Convert to Server Components where possible
2. Use URL-driven state for client-side filtering
3. Implement proper loading states

### Phase 3: Clean Up Remaining Effects
1. Replace prop sync with controlled components
2. Convert derivations to useMemo
3. Replace DOM reads with callback refs

### Phase 4: Optimize Remaining Effects
1. Ensure proper dependency arrays
2. Add proper cleanup functions
3. Split complex effects into focused ones

## Testing Effects

### 1. Test Effect Cleanup

```tsx
import { render, unmountComponentAtNode } from 'react-dom';

test('cleans up effect on unmount', () => {
  const cleanup = jest.fn();
  const TestComponent = () => {
    useEffect(() => {
      return cleanup;
    }, []);
    return null;
  };
  
  const container = document.createElement('div');
  render(<TestComponent />, container);
  unmountComponentAtNode(container);
  
  expect(cleanup).toHaveBeenCalled();
});
```

### 2. Test Effect Dependencies

```tsx
test('effect runs when dependencies change', () => {
  const effect = jest.fn();
  const { rerender } = render(<TestComponent effect={effect} />);
  
  expect(effect).toHaveBeenCalledTimes(1);
  
  rerender(<TestComponent effect={effect} />);
  expect(effect).toHaveBeenCalledTimes(2);
});
```

## Performance Considerations

### 1. Effect Frequency

```tsx
// ❌ BAD: Effect runs on every render
useEffect(() => {
  // Expensive operation
}, []); // Missing dependency causes warning

// ✅ GOOD: Effect only runs when needed
useEffect(() => {
  // Expensive operation
}, [dependency]); // Only runs when dependency changes
```

### 2. Effect Cleanup

```tsx
// ✅ GOOD: Proper cleanup prevents memory leaks
useEffect(() => {
  const subscription = subscribe();
  
  return () => {
    subscription.unsubscribe(); // ✅ Cleanup
  };
}, []);
```

### 3. Effect Splitting

```tsx
// ✅ GOOD: Split effects for better performance
useEffect(() => {
  // Lightweight operation
}, [lightweightDependency]);

useEffect(() => {
  // Heavy operation
}, [heavyDependency]);
```

