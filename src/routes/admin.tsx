import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

useEffect(() => {
  if (loading) return;

  if (!user) {
    router.navigate({ to: "/login", replace: true });
    return;
  }

  // هنا TypeScript صار يعرف أن user موجود
  if (user.role !== "admin") {
    router.navigate({ to: "/", replace: true });
    return;
  }
}, [user, loading]);

  // شاشة تحميل
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  // الصفحة الرئيسية للأدمن
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border p-5 shadow">
            <h2 className="text-lg font-semibold mb-2">Users</h2>
            <p className="text-sm text-muted-foreground">
              Manage users and roles
            </p>
          </div>

          <div className="rounded-xl border p-5 shadow">
            <h2 className="text-lg font-semibold mb-2">Orders</h2>
            <p className="text-sm text-muted-foreground">
              View and manage orders
            </p>
          </div>

          <div className="rounded-xl border p-5 shadow">
            <h2 className="text-lg font-semibold mb-2">Products</h2>
            <p className="text-sm text-muted-foreground">
              Add / edit products
            </p>
          </div>

          <div className="rounded-xl border p-5 shadow">
            <h2 className="text-lg font-semibold mb-2">Security Logs</h2>
            <p className="text-sm text-muted-foreground">
              Monitor threats and activity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}