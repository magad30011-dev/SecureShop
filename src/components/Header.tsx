import { Link, useRouter } from "@tanstack/react-router";
import { Shield, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/search", label: "Search" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/cart", label: "Cart" },
  { to: "/account", label: "Account" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow transition-smooth group-hover:scale-105">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Secure<span className="text-gradient">Shop</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}

          {user?.role === "admin" && (
            <>
              <Link
                to="/security"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                Security Report
              </Link>

              <Link
                to="/admin"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                Admin
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email}
                <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  {user.role}
                </span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  router.navigate({ to: "/" });
                }}
              >
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>

              <Button asChild size="sm" className="bg-gradient-primary shadow-glow">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="flex flex-col p-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}

            {user?.role === "admin" && (
              <>
                <Link
                  to="/security"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Security Report
                </Link>

                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Admin
                </Link>
              </>
            )}

            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    router.navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-1 h-4 w-4" /> Logout
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Login
                    </Link>
                  </Button>

                  <Button asChild size="sm" className="flex-1 bg-gradient-primary">
                    <Link to="/register" onClick={() => setOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}