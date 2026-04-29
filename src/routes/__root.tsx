import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SecureShop — Cybersecurity E-Commerce Project" },
      { name: "description", content: "SecureShop is a university cybersecurity project demonstrating secure web development: RASP, SAST, DAST, SCA and OWASP best practices." },
      { name: "author", content: "SecureShop Team" },
      { property: "og:title", content: "SecureShop — Cybersecurity E-Commerce Project" },
      { property: "og:description", content: "SecureShop is a university cybersecurity project demonstrating secure web development: RASP, SAST, DAST, SCA and OWASP best practices." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "SecureShop — Cybersecurity E-Commerce Project" },
      { name: "twitter:description", content: "SecureShop is a university cybersecurity project demonstrating secure web development: RASP, SAST, DAST, SCA and OWASP best practices." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/760e84ff-74d2-4760-887f-091042d1b04a/id-preview-4f2c0b63--3bc443fb-eabb-4b91-8fbf-d192fac81fbf.lovable.app-1777248059928.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/760e84ff-74d2-4760-887f-091042d1b04a/id-preview-4f2c0b63--3bc443fb-eabb-4b91-8fbf-d192fac81fbf.lovable.app-1777248059928.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
