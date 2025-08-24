/**
 * Minimal Form wrapper component using Conform v1.8.2
 *
 * @see https://conform.guide/integration/nextjs
 * @see https://nextjs.org/docs/app/guides/forms
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Form root component - simplified for now
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export function Form({ children, ...props }: FormProps) {
  return <form {...props}>{children}</form>;
}

// Form field wrapper
interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

// Form label component
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

export function FormLabel({ className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

// Form input component
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

export function FormInput({ name, className, ...props }: FormInputProps) {
  return (
    <input
      name={name}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// Form textarea component
interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
}

export function FormTextarea({ name, className, ...props }: FormTextareaProps) {
  return (
    <textarea
      name={name}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// Form select component
interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  children: React.ReactNode;
}

export function FormSelect({
  name,
  className,
  children,
  ...props
}: FormSelectProps) {
  return (
    <select
      name={name}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

// Form checkbox component
interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

export function FormCheckbox({ name, className, ...props }: FormCheckboxProps) {
  return (
    <input
      name={name}
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}

// Form error display component
interface FormErrorProps {
  name: string;
  className?: string;
}

export function FormError({ name, className }: FormErrorProps) {
  return (
    <div
      id={`${name}-error`}
      className={cn("text-sm text-destructive", className)}
      role="alert"
    >
      {/* Error will be displayed by the form validation */}
    </div>
  );
}

// Form submit button component
interface FormSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function FormSubmit({ className, children, ...props }: FormSubmitProps) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
