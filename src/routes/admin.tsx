import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import {
  useAuth,
  adminListUsers,
  adminSendPasswordReset,
  adminChangeOwnPassword,
  type AdminUserView,
} from "@/lib/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS, type Product } from "@/lib/data";
import { getLogs, subscribeLogs } from "@/lib/security";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Lock,
  Package,
  ShieldAlert,
  Users,
  Plus,
  Trash2,
  BarChart3,
  KeyRound,
  ImagePlus,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — SecureShop" },
      {
        name: "description",
        content:
          "Role-restricted admin dashboard for managing products and reviewing security events.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  if (loading) {
  return (
    <PageShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading...
      </div>
    </PageShell>
  );
}

  if (!user || user.role !== "admin") {
    return (
      <PageShell>
        <section className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 sm:px-6">
          <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-card">
            <Lock className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-3 text-2xl font-bold">Access Denied</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This page requires the <strong>admin</strong> role.
            </p>

            <div className="mt-5 flex justify-center gap-2">
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>

              <Button asChild variant="outline">
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

 return <AdminInner user={user} />;
}

function AdminInner({ user }: { user: any }) {
 

  const [items, setItems] = useState<Product[]>(PRODUCTS);
  const [logs, setLogs] = useState(getLogs());

  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [userMsg, setUserMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const [adminNewPw, setAdminNewPw] = useState("");
  const [adminPwMsg, setAdminPwMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [imageData, setImageData] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
    refreshUsers();

    const unsub = subscribeLogs(() => {
      setLogs(getLogs());
    });

    return unsub;
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data) {
      setItems(PRODUCTS);
      return;
    }

    const mapped: Product[] = data.map((row: any) => ({
      id: Number(row.id),
      name: row.name,
      category: row.category,
      price: Number(row.price),
      image: row.image_url || PRODUCTS[0].image,
      description: row.description || "",
      stock: row.stock ?? 0,
    }));

    setItems(mapped);
  }

  async function refreshUsers() {
    const list = await adminListUsers();
    setUsers(list);
  }

  const categories = useMemo(() => {
    const base = items.map((p) => p.category);
    return Array.from(new Set(base));
  }, [items]);

  const stats = useMemo(
    () => ({
      products: items.length,
      stock: items.reduce((sum, p) => sum + p.stock, 0),
      blocks: logs.filter((l) => l.level === "block").length,
      warns: logs.filter((l) => l.level === "warn").length,
    }),
    [items, logs]
  );

  function handleAddCategory() {
    const value = newCategory.trim();
    if (!value) return;

    setCategory(value);
    setNewCategory("");
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImageData(String(reader.result));
    };

    reader.readAsDataURL(file);
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !price || !category) return;

    const finalImage =
      imageUrl.trim() || imageData || PRODUCTS[0].image;

    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      category: category.trim(),
      description: "Custom admin-added product.",
      price: Number(price),
      image_url: finalImage,
      stock: 10,
    });

    if (error) {
      console.error(error);
      return;
    }

    setName("");
    setPrice("");
    setCategory("");
    setNewCategory("");
    setImageData("");
    setImageUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    loadProducts();
  }

  async function deleteProduct(id: number) {
    await supabase.from("products").delete().eq("id", id);
    loadProducts();
  }

  async function updateStock(id: number, current: number, diff: number) {
    const next = Math.max(0, current + diff);

    await supabase
      .from("products")
      .update({ stock: next })
      .eq("id", id);

    loadProducts();
  }

  async function handleSendReset(email: string) {
    setUserMsg(null);

    const res = await adminSendPasswordReset(email);

    if (!res.ok) {
      setUserMsg({
        ok: false,
        text: res.error ?? "Failed",
      });
      return;
    }

    setUserMsg({
      ok: true,
      text: `Password reset sent to ${email}`,
    });
  }

  async function handleAdminPwChange(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;

    const res = await adminChangeOwnPassword(adminNewPw);

    if (!res.ok) {
      setAdminPwMsg({
        ok: false,
        text: res.error ?? "Failed",
      });
      return;
    }

    setAdminNewPw("");

    setAdminPwMsg({
      ok: true,
      text: "Password updated successfully",
    });
  }

  return (
    <PageShell>
      <section className="bg-gradient-hero py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-sm text-white/70">Logged in as admin</p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Admin Dashboard
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Package,
              label: "Products",
              value: stats.products,
              color: "bg-primary/10 text-primary",
            },
            {
              icon: BarChart3,
              label: "Total Stock",
              value: stats.stock,
              color: "bg-accent/10 text-accent",
            },
            {
              icon: ShieldAlert,
              label: "Threats Blocked",
              value: stats.blocks,
              color: "bg-destructive/10 text-destructive",
            },
            {
              icon: Users,
              label: "Warnings",
              value: stats.warns,
              color: "bg-warning/10 text-warning",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-gradient-card p-5 shadow-card"
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}
              >
                <s.icon className="h-5 w-5" />
              </div>

              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Add Product */}
          <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
            <h2 className="text-lg font-semibold">Add Product</h2>

            <form onSubmit={addProduct} className="mt-4 space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label>Category</Label>

                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-2 flex gap-2">
                  <Input
                    value={newCategory}
                    placeholder="New category"
                    onChange={(e) =>
                      setNewCategory(e.target.value)
                    }
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCategory}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div>
                <Label>Or Upload</Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <ImagePlus className="mr-1 h-4 w-4" />
                  Upload Image
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </form>
          </div>

          {/* Manage Products */}
          <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card lg:col-span-2">
            <h2 className="text-lg font-semibold">
              Manage Products
            </h2>

            <div className="mt-4 max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Stock</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-border"
                    >
                      <td className="py-2 font-medium">
                        {p.name}
                      </td>

                      <td className="py-2 text-muted-foreground">
                        {p.category}
                      </td>

                      <td className="py-2">${p.price}</td>

                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <span>{p.stock}</span>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStock(
                                p.id,
                                p.stock,
                                1
                              )
                            }
                          >
                            +
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStock(
                                p.id,
                                p.stock,
                                -1
                              )
                            }
                          >
                            -
                          </Button>
                        </div>
                      </td>

                      <td className="py-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            deleteProduct(p.id)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                Account Tools
              </h2>
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold">
                  Change My Admin Password
                </h3>
              </div>

              <form
                onSubmit={handleAdminPwChange}
                className="mt-3 space-y-3"
              >
                <Input
                  type="password"
                  value={adminNewPw}
                  onChange={(e) =>
                    setAdminNewPw(e.target.value)
                  }
                  placeholder="New password"
                />

                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                >
                  Update Password
                </Button>

                {adminPwMsg && (
                  <p className="text-xs">
                    {adminPwMsg.text}
                  </p>
                )}
              </form>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card lg:col-span-2">
            <h2 className="text-lg font-semibold">
              Manage Users
            </h2>

            {userMsg && (
              <div className="mt-3 rounded-md border p-2 text-xs">
                {userMsg.text}
              </div>
            )}

            <div className="mt-4 max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-border"
                    >
                      <td className="py-2">{u.email}</td>
                      <td className="py-2">{u.role}</td>
                      <td className="py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleSendReset(u.email)
                          }
                        >
                          <KeyRound className="mr-1 h-3 w-3" />
                          Reset
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-muted-foreground"
                      >
                        No users yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}