# Forms: Canonical Pattern & Guardrails

## Core Principles

- **Use Conform for all NEW forms with Zod schemas**. Keep schemas colocated under `lib/validation/*`.
- **Prefer Server Actions for mutations**; client enhances UX only (no business logic in client).
- **Single source of truth**: one Zod schema reused for client & server validation.
- **Accessibility**: every field must expose `aria-invalid`, `aria-describedby`, and error id hooks provided by Conform.
- **Errors**: never rely on toast-only; render inline errors + optional toast.
- **File inputs & checkboxes**: use Conform helpers for value coercion; avoid manual string casting.
- **No custom `event.preventDefault()` for form submit** unless you have a specific reason; let `<form>` submit naturally.
- **RHF may be used only when complex uncontrolled components demand it**; still reuse the same Zod schema via resolver.

## Reference Documentation

- [Conform Next.js Integration (2024–2025)](https://conform.guide/integration/nextjs)
- [Next.js App Router forms with Server Actions (2024–2025)](https://nextjs.org/docs/app/guides/forms)

## Implementation Patterns

### 1. Basic Conform Form Structure

```tsx
import { Form, FormField, FormLabel, FormInput, FormSubmit, FormError } from "@/components/ui/Form";
import { userSchema } from "@/lib/validation/userSchemas";

export function UserForm() {
  return (
    <Form schema={userSchema} action={submitUser}>
      <FormField name="name">
        <FormLabel htmlFor="name">Name</FormLabel>
        <FormInput name="name" id="name" required />
        <FormError name="name" />
      </FormField>
      <FormSubmit>Submit</FormSubmit>
    </Form>
  );
}
```

### 2. Server Action with Same Schema

```tsx
async function submitUser(formData: FormData) {
  "use server";
  
  const submission = conformParse(userSchema, formData);
  
  if (!submission.success) {
    return submission.reply();
  }
  
  // Process valid data...
  return { success: true };
}
```

### 3. RHF Bridge Pattern (When Needed)

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/lib/validation/userSchemas";

export function ComplexForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema), // Same schema as server
  });

  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    // Call Server Action with same schema validation
    const result = await submitUser(data);
  };
}
```

## Accessibility Requirements

- Every form field must have proper `aria-invalid` attribute
- Error messages must be associated via `aria-describedby`
- Use semantic HTML (`<form>`, `<label>`, `<input>`)
- Provide clear error messages with `role="alert"`
- Support keyboard navigation and screen readers

## Error Handling

- **Inline errors**: Always display validation errors below the field
- **Toast notifications**: Optional for success/global errors
- **Field-level errors**: Use Conform's built-in error handling
- **Server errors**: Display in form context, not just toasts

## File Uploads & Complex Inputs

- Use Conform's file input helpers for proper value handling
- Avoid manual string casting for checkboxes/radios
- Leverage Conform's coercion utilities for complex inputs
- Handle file validation on both client and server

## Progressive Enhancement

- Forms must work without JavaScript
- Server Actions handle all validation and processing
- Client-side validation enhances UX but doesn't replace server validation
- Graceful degradation for all interactive features

