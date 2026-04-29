import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { raspInspect } from "@/lib/security";

const GENERIC_ERROR = "البيانات المدخلة خاطئة";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — SecureShop" },
      {
        name: "description",
        content:
          "Securely log in to SecureShop using salted, hashed credentials and session protection.",
      },
      { property: "og:title", content: "Login — SecureShop" },
      {
        property: "og:description",
        content: "Securely log in to SecureShop.",
      },
    ],
  }),
  component: LoginPage,
});

const Schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password required").max(200),
});

function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onGoogle = async () => {
    setError(null);

    try {
      setGoogleLoading(true);

      const res = await loginWithGoogle();

      if (!res.ok) {
        setError(res.error ?? GENERIC_ERROR);
      }
    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      setError(GENERIC_ERROR);
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = Schema.safeParse({ email, password });

    if (!parsed.success) {
      setError(GENERIC_ERROR);
      return;
    }

    const insp = raspInspect(email, "login");

    if (!insp.safe) {
      setError(GENERIC_ERROR);
      return;
    }

    try {
      setLoading(true);

      const res = await login(
        parsed.data.email,
        parsed.data.password
      );

      if (!res.ok) {
        setError(res.error ?? GENERIC_ERROR);
        return;
      }

      router.navigate({ to: "/" });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-12 sm:px-6">
        <div className="w-full rounded-2xl border border-border bg-gradient-card p-8 shadow-elevated">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in securely to your account
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onGoogle}
            disabled={googleLoading || loading}
            className="mb-4 h-11 w-full gap-2 border-border bg-background hover:bg-secondary"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>

            {googleLoading
              ? "Redirecting..."
              : "Continue with Google"}
          </Button>

          <div className="relative mb-4 text-center text-xs text-muted-foreground">
            <span className="relative z-10 bg-gradient-card px-2">
              or sign in with email
            </span>
            <div className="absolute left-0 right-0 top-1/2 -z-0 border-t border-border" />
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-4"
            noValidate
          >
            <div>
              <Label htmlFor="email">Email</Label>

              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={200}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="h-11 w-full bg-gradient-primary shadow-glow"
            >
              {loading
                ? "Signing in..."
                : "Sign In Securely"}
            </Button>
          </form>

          <div className="mt-5 rounded-md bg-secondary p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3 w-3 text-success" />
            Protected by hashing, salting, input validation,
            and session expiry.
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}