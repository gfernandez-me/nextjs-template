"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/ui/alert";
import { Terminal } from "lucide-react";

import { IconLoader } from "@tabler/icons-react";
import { ErrorContext } from "better-auth/react";

export function ChangePasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword !== newPassword2) {
      setError("New passwords do not match");
      return;
    }

    await authClient.changePassword(
      {
        /**
         * The user new password
         */
        newPassword,
        /**
         * The user current password
         */
        currentPassword,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          // redirect to the login page
          alert("Password changed successfully");
          router.push("/login");
        },
        onError: (ctx: ErrorContext) => {
          // display the error message
          setError(ctx.error.message);
          setLoading(false);
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Change your password</CardTitle>
          <CardDescription>
            Enter your current password and new password to change your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border border-red-500" variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  value={currentPassword}
                  id="currentPassword"
                  type="password"
                  placeholder="********"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  onChange={(e) => setNewPassword(e.target.value)}
                  value={newPassword}
                  id="newPassword"
                  type="password"
                  placeholder="********"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="newPassword">New Password (again)</Label>
                <Input
                  onChange={(e) => setNewPassword2(e.target.value)}
                  value={newPassword2}
                  id="newPassword2"
                  type="password"
                  placeholder="********"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button disabled={loading} type="submit" className="w-full">
                  {loading ? (
                    <IconLoader className="animate-spin" stroke={2} />
                  ) : (
                    "Change Password"
                  )}
                </Button>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
