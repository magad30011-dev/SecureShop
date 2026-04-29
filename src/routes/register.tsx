import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — SecureShop" },
      { name: "description", content: "Create a SecureShop account with strong password requirements and salted hashing." },
      { property: "og:title", content: "Register — SecureShop" },
      { property: "og:description", content: "Create a SecureShop account securely." },
    ],
  }),
  component: RegisterPage,
});

// Strong password policy
const Schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string()
    .min(10, "At least 10 characters")
    .max(200)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
});

const rules = [
  { label: "At least 10 characters", test: (p: string) => p.length >= 10 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const GENERIC_ERROR = "البيانات المدخلة خاطئة";

function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (!res.ok) setError(res.error ?? GENERIC_ERROR);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = Schema.safeParse({ email, password });
    if (!parsed.success) {
      // Generic message — never reveal which field/rule failed.
      setError(GENERIC_ERROR);
      return;
    }
    setLoading(true);
    const res = await register(parsed.data.email, parsed.data.password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? GENERIC_ERROR);
      return;
    }
    // Email confirmation required — fake/non-existing emails can never confirm.
    setSuccess(true);
    setTimeout(() => router.navigate({ to: "/login" }), 4000);
  };

  return (
    <PageShell>
      <section className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-12 sm:px-6">
        <div className="w-full rounded-2xl border border-border bg-gradient-card p-8 shadow-elevated">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create account</h1>
              <p className="text-sm text-muted-foreground">Join SecureShop in seconds</p>
            </div>
          </div>

          {/* Google sign-up — instant, no manual form */}
          <Button
            type="button"
            variant="outline"
            onClick={onGoogle}
            disabled={googleLoading || loading}
            className="mb-4 h-11 w-full gap-2 border-border bg-background hover:bg-secondary"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </Button>

          <div className="relative mb-4 text-center text-xs text-muted-foreground">
            <span className="bg-gradient-card px-2 relative z-10">or create an account manually</span>
            <div className="absolute left-0 right-0 top-1/2 -z-0 border-t border-border" />
          </div>

          {success && (
            <div className="mb-4 rounded-md border border-success/40 bg-success/10 p-3 text-sm text-success">
              ✓ تم إرسال رابط تأكيد إلى بريدك. افتح بريدك واضغط على الرابط لتفعيل الحساب. الحسابات الوهمية لا يمكنها التأكيد.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="you@example.com" maxLength={255} autoComplete="email" />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" placeholder="••••••••••" maxLength={200} autoComplete="new-password" />
              </div>
            </div>

            <ul className="space-y-1 text-xs">
              {rules.map((r) => {
                const ok = r.test(password);
                return (
                  <li key={r.label} className={`flex items-center gap-2 ${ok ? "text-success" : "text-muted-foreground"}`}>
                    {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {r.label}
                  </li>
                );
              })}
            </ul>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" disabled={loading} className="h-11 w-full bg-gradient-primary shadow-glow">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
