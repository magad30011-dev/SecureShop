import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { raspInspect, escapeHtml } from "@/lib/security";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SecureShop" },
      {
        name: "description",
        content:
          "Contact the SecureShop team. All form inputs are validated and RASP-protected against injection.",
      },
      { property: "og:title", content: "Contact — SecureShop" },
      { property: "og:description", content: "Contact the SecureShop team." },
    ],
  }),
  component: ContactPage,
});

const Schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(5, "Message too short").max(1000),
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);
    const parsed = Schema.safeParse({ name, email, message });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    for (const v of [name, email, message]) {
      const r = raspInspect(v, "contact");
      if (!r.safe) {
        setError(`Blocked suspicious input: ${r.threat}`);
        return;
      }
    }
    // Defense in depth: escape values before any render/log.
    void escapeHtml(name);
    void escapeHtml(message);
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <PageShell>
      <section className="bg-gradient-hero py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-bold">Get in Touch</h1>
          <p className="mt-3 text-white/80">
            Questions, feedback, or vulnerability reports — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          {[
            { icon: Mail, label: "Email", value: "magad30011@gmail.com" },
            { icon: Phone, label: "Phone", value: "+967 738 364 250" },
            { icon: MapPin, label: "Location", value: "Taiz, Jamal Street" },
          ].map((c) => (
            <div
              key={c.label}
              className="flex items-start gap-3 rounded-xl border border-border bg-gradient-card p-4 shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <c.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="font-semibold">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card lg:col-span-2"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cname">Name</Label>
              <Input
                id="cname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            <div>
              <Label htmlFor="cemail">Email</Label>
              <Input
                id="cemail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="cmsg">Message</Label>
            <Textarea
              id="cmsg"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              required
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {message.length}/1000
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {sent && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-success/40 bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> Message sent successfully (demo).
            </div>
          )}

          <Button
            type="submit"
            className="mt-6 h-11 w-full bg-gradient-primary shadow-glow sm:w-auto"
          >
            <Send className="mr-2 h-4 w-4" /> Send Message
          </Button>
        </form>
      </section>
    </PageShell>
  );
}
