# Zod + Conform: Validation & Form Handling

## Core Validation Principles

- **Single Schema Source**: Define validation schema once, use everywhere
- **Type Safety**: Leverage Zod inference for full TypeScript support
- **Progressive Enhancement**: Server validation is primary, client enhances UX
- **Accessibility First**: All validation errors must be accessible

## Schema Organization

### File Structure
```
src/lib/validation/
├── common.ts          # Shared validators and utilities
├── userSchemas.ts     # User-related schemas
├── gearSchemas.ts     # Gear-related schemas
└── index.ts          # Re-exports for convenience
```

### Schema Design Patterns

```tsx
// 1. Use common validators for consistency
import { commonValidators, createFormSchema } from "./common";

export const userSchema = createFormSchema({
  name: commonValidators.name,
  email: commonValidators.email,
  password: commonValidators.password,
});

// 2. Leverage Zod's refinement for complex validation
export const gearSchema = createFormSchema({
  type: z.enum(["WEAPON", "ARMOR", "HELM", "NECK", "RING", "BOOTS"]),
  level: z.coerce.number().int().min(1).max(88),
  enhance: z.coerce.number().int().min(0).max(15),
}).refine((data) => {
  // Custom business logic validation
  return data.type === "WEAPON" ? data.level >= 70 : true;
}, {
  message: "Weapons must be level 70+",
  path: ["level"],
});
```

## Conform Integration

### Form Component Usage

```tsx
import { Form, FormField, FormLabel, FormInput, FormError } from "@/components/ui/Form";

export function GearForm() {
  return (
    <Form schema={gearSchema} action={submitGear}>
      <FormField name="type">
        <FormLabel htmlFor="type">Gear Type</FormLabel>
        <FormInput name="type" id="type" required />
        <FormError name="type" />
      </FormField>
    </Form>
  );
}
```

### Server Action Pattern

```tsx
import { conformParse } from "@/lib/validation/common";

async function submitGear(formData: FormData) {
  "use server";
  
  const submission = conformParse(gearSchema, formData);
  
  if (!submission.success) {
    return submission.reply();
  }
  
  // submission.value is fully typed and validated
  const gearData = submission.value;
  
  // Process gear data...
  return { success: true };
}
```

## Validation Best Practices

### 1. Use Appropriate Zod Coercion

```tsx
// ✅ Good: Use coercion for form inputs
const schema = z.object({
  level: z.coerce.number().int().min(1).max(88),
  isActive: z.coerce.boolean(),
  tags: z.coerce.string().transform(s => s.split(',').map(t => t.trim())),
});

// ❌ Avoid: Manual string parsing
const schema = z.object({
  level: z.string().transform(s => parseInt(s, 10)), // More complex
});
```

### 2. Leverage Zod's Built-in Validators

```tsx
// ✅ Good: Use Zod's built-in validators
const schema = z.object({
  email: z.string().email("Invalid email format"),
  age: z.number().int().positive("Age must be positive"),
  website: z.string().url("Invalid URL format").optional(),
});

// ❌ Avoid: Custom regex when Zod has built-ins
const schema = z.object({
  email: z.string().regex(/^[^@]+@[^@]+\.[^@]+$/, "Invalid email"), // More complex
});
```

### 3. Handle Complex Validation with Refinement

```tsx
const gearSchema = z.object({
  type: z.enum(["WEAPON", "ARMOR", "HELM"]),
  mainStat: z.string(),
  substats: z.array(z.string()),
}).refine((data) => {
  // Business logic validation
  if (data.type === "WEAPON") {
    return data.mainStat === "ATT" || data.mainStat === "ATT_RATE";
  }
  return true;
}, {
  message: "Weapons can only have Attack main stats",
  path: ["mainStat"],
});
```

## Error Handling

### 1. Field-Level Errors

```tsx
<FormField name="email">
  <FormLabel htmlFor="email">Email</FormLabel>
  <FormInput 
    name="email" 
    id="email" 
    type="email" 
    required 
  />
  <FormError name="email" />
</FormField>
```

### 2. Form-Level Errors

```tsx
const submission = conformParse(schema, formData);

if (!submission.success) {
  return submission.reply({
    formErrors: ["There was an error processing your request"],
  });
}
```

### 3. Custom Error Messages

```tsx
const schema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Password must contain letters and numbers"),
});
```

## Type Safety

### 1. Schema Inference

```tsx
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// TypeScript automatically infers the type
type User = z.infer<typeof userSchema>;
// Result: { name: string; email: string; }
```

### 2. Partial Schemas for Updates

```tsx
const userUpdateSchema = userSchema.partial();
type UserUpdate = z.infer<typeof userUpdateSchema>;
// Result: { name?: string; email?: string; }
```

### 3. Union Types for Variants

```tsx
const gearSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("WEAPON"), attack: z.number() }),
  z.object({ type: z.literal("ARMOR"), defense: z.number() }),
]);

type Gear = z.infer<typeof gearSchema>;
// Result: { type: "WEAPON"; attack: number; } | { type: "ARMOR"; defense: number; }
```

## Testing Validation

### 1. Unit Tests for Schemas

```tsx
import { gearSchema } from "@/lib/validation/gearSchemas";

describe("gearSchema", () => {
  it("validates valid gear data", () => {
    const validData = {
      type: "WEAPON",
      level: 70,
      enhance: 15,
    };
    
    const result = gearSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid gear data", () => {
    const invalidData = {
      type: "INVALID_TYPE",
      level: 999,
      enhance: 20,
    };
    
    const result = gearSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

### 2. Integration Tests for Forms

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { GearForm } from "./GearForm";

describe("GearForm", () => {
  it("shows validation errors for invalid input", async () => {
    render(<GearForm />);
    
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Should show validation errors
    expect(await screen.findByText(/gear type is required/i)).toBeInTheDocument();
  });
});
```

## Performance Considerations

### 1. Schema Caching

```tsx
// ✅ Good: Cache parsed schemas
const cachedSchema = gearSchema.parse;

// ❌ Avoid: Re-parsing schemas on every validation
const result = gearSchema.parse(data);
```

### 2. Lazy Validation

```tsx
// Use Conform's shouldValidate and shouldRevalidate options
const [form, fields] = useForm({
  schema: gearSchema,
  shouldValidate: "onBlur",        // Validate on field blur
  shouldRevalidate: "onInput",     // Re-validate on input change
});
```

## Migration from RHF

### 1. Gradual Migration

```tsx
// Keep RHF for complex forms, but use same schema
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function ComplexForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(gearSchema), // Same schema as Conform forms
  });
  
  // ... rest of form
}
```

### 2. Schema Sharing

```tsx
// Define schema once, use in both places
export const gearSchema = z.object({
  type: z.enum(["WEAPON", "ARMOR", "HELM"]),
  level: z.number().int().min(1).max(88),
});

// Conform form
<Form schema={gearSchema} action={submitGear}>

// RHF form
const { register } = useForm({
  resolver: zodResolver(gearSchema),
});
```

## Common Pitfalls

### 1. Avoid String Literals

```tsx
// ❌ Bad: String literals for enums
const schema = z.object({
  type: z.enum(["WEAPON", "ARMOR"]), // Hard to maintain
});

// ✅ Good: Use constants or imports
import { GearType } from "@/types";
const schema = z.object({
  type: z.nativeEnum(GearType), // Type-safe and maintainable
});
```

### 2. Don't Skip Server Validation

```tsx
// ❌ Bad: Only client validation
const { register } = useForm({
  resolver: zodResolver(schema),
});

// ✅ Good: Same schema on both sides
const { register } = useForm({
  resolver: zodResolver(schema),
});

async function submit(formData: FormData) {
  const result = conformParse(schema, formData); // Same validation
}
```

### 3. Handle All Error Cases

```tsx
// ❌ Bad: Only handle success case
if (submission.success) {
  // Process data
}

// ✅ Good: Handle all cases
if (submission.success) {
  // Process data
} else {
  // Handle validation errors
  return submission.reply();
}
```

