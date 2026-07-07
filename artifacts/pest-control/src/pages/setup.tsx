import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Setup() {
  const { getToken } = useAuth();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleBootstrap() {
    setStatus("loading");
    try {
      const token = await getToken();
      const data = await apiFetch<{ message: string; email: string; role: string }>(
        "/admin/bootstrap",
        { method: "POST", token },
      );
      setMessage(`${data.message} (${data.email})`);
      setStatus("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessage(msg);
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>First-time Admin Setup</CardTitle>
          <CardDescription>
            This button works only once — when no admin exists yet. Sign in first,
            then click below to make your account the admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === "done" ? (
            <>
              <p className="text-sm text-green-700 bg-green-50 rounded-md p-3 border border-green-200">
                ✓ {message}
              </p>
              <Button onClick={() => setLocation("/dashboard/admin")}>
                Go to Admin Dashboard
              </Button>
            </>
          ) : (
            <>
              {status === "error" && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md p-3 border border-destructive/20">
                  {message}
                </p>
              )}
              <Button
                onClick={handleBootstrap}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Promoting…" : "Make me Admin"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
