import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { getLogs, subscribeLogs, type SecurityEvent } from "@/lib/security";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Bug,
  Package2,
  ScanSearch,
  FileCode2,
  Activity,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security Report — SecureShop" },
      {
        name: "description",
        content:
          "Full security report: requirements, threat model, RASP events, SCA, SAST, DAST and vulnerability remediation.",
      },
      { property: "og:title", content: "Security Report — SecureShop" },
      { property: "og:description", content: "Full SecureShop security report." },
    ],
  }),
  component: SecurityPage,
});

const REQUIREMENTS = [
  {
    title: "Secure Login",
    desc: "Salted SHA-256 hash, rate-limit warnings, generic error messages.",
  },
  {
    title: "Password Hashing",
    desc: "Per-user random salt + Web Crypto digest. (Use bcrypt/argon2 server-side in prod.)",
  },
  {
    title: "Input Validation",
    desc: "Zod schemas on every form: type, length, format, allow-list regex.",
  },
  { title: "Session Security", desc: "30-minute TTL, validated on load, cleared on logout." },
  {
    title: "Role-Based Access Control",
    desc: "Admin-only routes guarded by RBAC checks (see /admin).",
  },
  {
    title: "Error Handling",
    desc: "User-safe messages; technical details only logged internally.",
  },
  { title: "Logging", desc: "All auth, RASP and session events recorded with timestamps." },
];

const THREATS = [
  {
    actor: "External attacker",
    path: "Public form → SQL injection in search",
    risk: "High",
    mitigation: "RASP regex + parameterized queries (prod)",
  },
  {
    actor: "Malicious user",
    path: "Login form → credential stuffing",
    risk: "High",
    mitigation: "Rate limiting, lockout, MFA (planned)",
  },
  {
    actor: "XSS attacker",
    path: "Contact form → stored XSS",
    risk: "Medium",
    mitigation: "React escaping + escapeHtml + CSP",
  },
  {
    actor: "Privileged abuse",
    path: "User → /admin direct URL",
    risk: "Medium",
    mitigation: "RBAC enforced server + client side",
  },
  {
    actor: "Session hijacker",
    path: "Stolen token → API access",
    risk: "Medium",
    mitigation: "Short TTL + httpOnly cookies (prod)",
  },
];

const SCA = [
  { pkg: "react", version: "19.x", risk: "Low", note: "Latest stable" },
  { pkg: "@tanstack/react-router", version: "1.x", risk: "Low", note: "Actively maintained" },
  { pkg: "zod", version: "3.x", risk: "Low", note: "Validation library" },
  { pkg: "lucide-react", version: "latest", risk: "Low", note: "Icon set, no runtime risk" },
  { pkg: "tailwindcss", version: "4.x", risk: "Low", note: "Build-time only" },
];

const SAST_NOTES = [
  "All forms validated with Zod schemas — see src/routes/login.tsx and search.tsx.",
  "Passwords never stored in plaintext — see src/lib/auth.tsx.",
  "RASP module inspects every untrusted input — src/lib/security.ts.",
  "React auto-escapes JSX; manual escapeHtml() helper for any future dangerouslySetInnerHTML.",
  "No direct localStorage of secrets; only public session metadata.",
];

const DAST_TARGETS = [
  { page: "/login", check: "Brute-force, SQLi in email field" },
  { page: "/register", check: "Weak password acceptance, account enumeration" },
  { page: "/search", check: "SQLi, XSS reflected in query parameter" },
  { page: "/contact", check: "Stored XSS in message field" },
  { page: "/admin", check: "Forced browsing / RBAC bypass" },
];

const VULNS = [
  {
    id: "V-01",
    title: "No password complexity",
    before: "6-char min",
    after: "10+ chars, upper/lower/number/symbol",
    status: "Fixed",
  },
  {
    id: "V-02",
    title: "Plaintext password in localStorage",
    before: "Stored as-is",
    after: "Salted SHA-256 hash",
    status: "Fixed",
  },
  {
    id: "V-03",
    title: "No XSS protection on search",
    before: "Raw user input rendered",
    after: "Validated + RASP + React escape",
    status: "Fixed",
  },
  {
    id: "V-04",
    title: "Admin route accessible to all",
    before: "Public route",
    after: "RBAC check on /admin",
    status: "Fixed",
  },
  {
    id: "V-05",
    title: "No session expiry",
    before: "Indefinite",
    after: "30-minute TTL with cleanup",
    status: "Fixed",
  },
];

function levelStyles(level: SecurityEvent["level"]) {
  if (level === "block")
    return { Icon: ShieldAlert, cls: "text-destructive bg-destructive/10 border-destructive/30" };
  if (level === "warn")
    return { Icon: AlertTriangle, cls: "text-warning bg-warning/10 border-warning/30" };
  return { Icon: Info, cls: "text-primary bg-primary/10 border-primary/30" };
}

function SecurityPage() {
 const [logs, setLogs] = useState<any[]>([]);

useEffect(() => {
  loadLogs();

  const interval = setInterval(loadLogs, 2000); // كل ثانيتين

  return () => clearInterval(interval);
}, []);
async function loadLogs() {
  const { data, error } = await supabase
    .from("security_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  setLogs(data || []);
}
  return (
    <PageShell>
      <section className="bg-gradient-hero py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs">
            <ShieldCheck className="h-3 w-3" /> Live Report
          </span>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Security Report</h1>
          <p className="mt-3 text-white/80">
            Requirements, threat model, RASP, SCA, SAST, DAST and remediation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
        {/* 1. Requirements */}
        <Section icon={Lock} title="1. Security Requirements">
          <div className="grid gap-3 sm:grid-cols-2">
            {REQUIREMENTS.map((r) => (
              <div key={r.title} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-success" /> {r.title}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 2. Threat model */}
        <Section icon={Bug} title="2. Threat Model">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left">
                <tr>
                  <th className="p-3">Attacker</th>
                  <th className="p-3">Attack Path</th>
                  <th className="p-3">Risk</th>
                  <th className="p-3">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {THREATS.map((t, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 font-medium">{t.actor}</td>
                    <td className="p-3 text-muted-foreground">{t.path}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.risk === "High" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}
                      >
                        {t.risk}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{t.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Simple diagram */}
          <div className="mt-6 rounded-lg border border-border bg-gradient-card p-6">
            <div className="mb-3 text-sm font-semibold text-muted-foreground">
              Threat Flow Diagram
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <Box label="Attacker" tone="destructive" />
              <Arrow />
              <Box label="Public Form" />
              <Arrow />
              <Box label="Validation + RASP" tone="primary" />
              <Arrow />
              <Box label="Application" tone="success" />
            </div>
          </div>
        </Section>

        {/* 3. RASP */}
        <Section icon={Activity} title="3. Runtime Application Self-Protection (RASP)">
          <p className="mb-4 text-sm text-muted-foreground">
            Live event log. Try injecting{" "}
            <code className="rounded bg-secondary px-1">' OR 1=1 --</code> on the search page to
            generate a new entry.
          </p>
          <div className="space-y-2">
            {logs.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
           {logs.map((ev, i) => (
  <div
    key={i}
    className="flex items-start gap-3 rounded-lg border p-3 text-sm border-destructive/40 bg-destructive/10 text-destructive"
  >
    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />

    <div className="min-w-0 flex-1">
      <div className="font-semibold">
        {ev.threat || "Security Event"}
      </div>

      <div className="mt-1 break-words">
        <strong>Input:</strong> {ev.input}
      </div>

      <div className="mt-1 text-xs opacity-70">
        {new Date(ev.created_at).toLocaleString()}
      </div>
    </div>
  </div>
))}
          </div>
        </Section>

        {/* 4. SCA */}
        <Section icon={Package2} title="4. Software Composition Analysis (SCA)">
          <p className="mb-3 text-sm text-muted-foreground">
            Third-party dependencies are reviewed regularly. Outdated packages increase exposure to
            known CVEs (e.g., supply-chain or prototype-pollution risks).
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left">
                <tr>
                  <th className="p-3">Package</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Risk</th>
                  <th className="p-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {SCA.map((s) => (
                  <tr key={s.pkg} className="border-t border-border">
                    <td className="p-3 font-mono">{s.pkg}</td>
                    <td className="p-3">{s.version}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        {s.risk}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 5. SAST */}
        <Section icon={FileCode2} title="5. Static Application Security Testing (SAST)">
          <p className="mb-3 text-sm text-muted-foreground">
            Recommended scanners: <strong>SonarQube</strong>, <strong>Semgrep</strong>,{" "}
            <strong>ESLint security plugin</strong>. Apply on every PR in CI.
          </p>
          <ul className="space-y-2 text-sm">
            {SAST_NOTES.map((n, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-md border border-border bg-card p-3"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {n}
              </li>
            ))}
          </ul>
        </Section>

        {/* 6. DAST */}
        <Section icon={ScanSearch} title="6. Dynamic Application Security Testing (DAST)">
          <p className="mb-3 text-sm text-muted-foreground">
            All public pages are designed to be scannable by <strong>OWASP ZAP</strong> (active +
            passive scan). Recommended profile: ZAP Baseline + Full Scan.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left">
                <tr>
                  <th className="p-3">Page</th>
                  <th className="p-3">Recommended Check</th>
                </tr>
              </thead>
              <tbody>
                {DAST_TARGETS.map((d) => (
                  <tr key={d.page} className="border-t border-border">
                    <td className="p-3 font-mono">{d.page}</td>
                    <td className="p-3 text-muted-foreground">{d.check}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 7. Vulnerability scanning */}
        <Section icon={ShieldAlert} title="7. Vulnerability Report — Before & After">
          <div className="grid gap-3">
            {VULNS.map((v) => (
              <div key={v.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">
                    {v.id} — {v.title}
                  </div>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                    {v.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                    <div className="text-xs font-semibold uppercase text-destructive">Before</div>
                    <div className="mt-1 text-muted-foreground">{v.before}</div>
                  </div>
                  <div className="rounded-md border border-success/30 bg-success/5 p-3 text-sm">
                    <div className="text-xs font-semibold uppercase text-success">After</div>
                    <div className="mt-1 text-muted-foreground">{v.after}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </PageShell>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Lock;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Box({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: "destructive" | "primary" | "success" | "muted";
}) {
  const cls = {
    destructive: "border-destructive/40 bg-destructive/10 text-destructive",
    primary: "border-primary/40 bg-primary/10 text-primary",
    success: "border-success/40 bg-success/10 text-success",
    muted: "border-border bg-card text-foreground",
  }[tone];
  return <div className={`rounded-md border px-3 py-2 text-sm font-medium ${cls}`}>{label}</div>;
}
function Arrow() {
  return <span className="text-muted-foreground">→</span>;
}
