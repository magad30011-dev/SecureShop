import { createFileRoute, Navigate } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/auth";
import { User, ShoppingBag, Shield, LogOut } from "lucide-react";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-4xl font-bold">My Account</h1>
          <p className="mt-2 text-white/80">Manage your profile and account settings.</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
                <User className="h-8 w-8" />
              </div>

              <div>
                <h2 className="text-lg font-bold">{user.email?.split("@")[0]}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
              {user.role}
            </div>

            <button
              onClick={logout}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </aside>

          {/* Main */}
          <div className="space-y-6">
            {/* Profile */}
            <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
              <h3 className="text-2xl font-bold">Profile Information</h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Full Name" value={user.email?.split("@")[0] || ""} />
                <Field label="Email" value={user.email || ""} />
                <Field label="Phone" value="" />
                <Field label="Country" value="" />
              </div>

              <button className="mt-6 rounded-2xl bg-primary px-5 py-3 font-semibold text-white">
                Save Changes
              </button>
            </div>

            {/* Orders */}
            <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h3 className="text-2xl font-bold">Recent Orders</h3>
              </div>

              <div className="mt-5 space-y-3">
                <OrderRow id="#1001" total="$240" status="Delivered" />
                <OrderRow id="#1002" total="$90" status="Processing" />
              </div>
            </div>

            {/* Security */}
            <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <h3 className="text-2xl font-bold">Security</h3>
              </div>

              <div className="mt-5 space-y-3">
                <Action text="Change Password" />
                <Action text="Enable 2FA" />
                <Action text="Login Activity" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-muted-foreground">{label}</label>

      <input
        defaultValue={value}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
      />
    </div>
  );
}

function OrderRow({ id, total, status }: { id: string; total: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
      <span>{id}</span>
      <span>{total}</span>
      <span>{status}</span>
    </div>
  );
}

function Action({ text }: { text: string }) {
  return (
    <button className="w-full rounded-2xl border border-border px-4 py-3 text-left hover:bg-secondary">
      {text}
    </button>
  );
}
