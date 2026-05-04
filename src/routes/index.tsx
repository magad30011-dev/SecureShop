import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/data";
import {
  Shield,
  Lock,
  Eye,
  Activity,
  Code2,
  ScanSearch,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import heroImg from "@/assets/hero-security.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SecureShop — Secure E-Commerce Demo" },
      {
        name: "description",
        content:
          "Modern e-commerce app with built-in cybersecurity: RASP, secure auth, threat modeling, OWASP-aligned defenses.",
      },
      { property: "og:title", content: "SecureShop — Secure E-Commerce Demo" },
      {
        property: "og:description",
        content: "Modern e-commerce app with built-in cybersecurity defenses.",
      },
    ],
  }),
  component: Index,
});

const FEATURES = [
  {
    icon: Lock,
    title: "Secure Authentication",
    desc: "Hashed passwords with per-user salt, session expiry and RBAC.",
  },
  {
    icon: Shield,
    title: "RASP Protection",
    desc: "Runtime detection of SQLi, XSS and path-traversal attacks.",
  },
  {
    icon: Eye,
    title: "Audit Logging",
    desc: "Every auth and threat event is recorded for forensics.",
  },
  {
    icon: Activity,
    title: "Threat Modeling",
    desc: "STRIDE-based attack paths, risks and mitigations.",
  },
  {
    icon: Code2,
    title: "SAST Reviewed",
    desc: "Static analysis comments and secure-code patterns throughout.",
  },
  {
    icon: ScanSearch,
    title: "DAST Ready",
    desc: "Pages designed for OWASP ZAP automated scanning.",
  },
];

function Index() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 grid-pattern opacity-40" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
              <Shield className="h-3 w-3" />
              University Cybersecurity Project
            </span>

            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Shop with <span className="text-gradient">Security</span> Built In
            </h1>

            <p className="mt-5 max-w-xl text-lg text-white/80">
              SecureShop is a full e-commerce demo that showcases secure coding, threat modeling,
              RASP, SAST, DAST and SCA — all in one production-style React application.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary shadow-glow animate-pulse-glow"
              >
                <Link to="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                OWASP Top 10
              </span>

              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                RASP Active
              </span>

              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                RBAC Enforced
              </span>
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <img
              src={heroImg}
              alt="Cybersecurity shield protecting an online shopping bag"
              width={1600}
              height={900}
              className="rounded-2xl shadow-elevated"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Security at Every Layer</h2>

          <p className="mt-3 text-muted-foreground">
            Designed around the seven core topics of modern application security.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-gradient-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elevated animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>

              <h3 className="text-lg font-semibold">{f.title}</h3>

              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>

            <p className="mt-2 text-muted-foreground">Hand-picked, securely served.</p>
          </div>

          <Button asChild variant="ghost">
            <Link to="/products">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.slice(0, 3).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
