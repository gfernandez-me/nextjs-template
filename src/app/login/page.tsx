"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LoginForm } from "@/components/auth/login-form";

function LoginContent() {
  const params = useSearchParams();
  const reason = params.get("reason");

  useEffect(() => {
    if (reason === "auth") {
      toast.warning("Please sign in to continue.");
    }
  }, [reason]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
