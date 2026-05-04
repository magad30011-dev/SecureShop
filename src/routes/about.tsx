import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { TEAM, TECHNOLOGIES } from "@/lib/data";
import { GraduationCap, Shield, Code2, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SecureShop" },
      {
        name: "description",
        content:
          "Meet the team behind SecureShop and the technologies powering this cybersecurity university project.",
      },
      { property: "og:title", content: "About — SecureShop" },
      { property: "og:description", content: "Meet the team behind SecureShop." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <section className="bg-gradient-hero py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs">
            <GraduationCap className="h-3 w-3" /> University Capstone
          </span>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">About the Project</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            SecureShop is a hands-on cybersecurity capstone built by a team of four students to
            demonstrate secure web development end-to-end.
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Project Description</h2>
          </div>
          <p className="mt-4 text-muted-foreground">
            SecureShop is a fully responsive e-commerce demonstrator that integrates the seven
            pillars of modern application security: secure requirements, threat modeling, RASP, SCA,
            SAST, DAST, and continuous vulnerability scanning. Every page, form, and component is
            designed to illustrate a real-world security pattern in a way that is easy to read and
            grade.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Our Team</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-border bg-gradient-card p-6 text-center shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-primary-foreground shadow-glow">
                {m.initials}
              </div>
              <h3 className="mt-4 font-semibold">{m.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="flex items-center gap-3">
            <Code2 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Technologies Used</h2>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {TECHNOLOGIES.map((t) => (
              <span
                key={t}
                className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
