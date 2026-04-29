import { Link } from "@tanstack/react-router";
import { Shield, Github, Mail, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">SecureShop</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            A university cybersecurity project demonstrating secure web development practices.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Pages</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/products" className="hover:text-primary">Products</Link></li>
            <li><Link to="/search" className="hover:text-primary">Search</Link></li>
            <li><Link to="/about" className="hover:text-primary">About Project</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Security</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/security" className="hover:text-primary">Security Report</Link></li>
            <li className="flex items-center gap-1"><Lock className="h-3 w-3" /> RASP enabled</li>
            <li className="flex items-center gap-1"><Shield className="h-3 w-3" /> OWASP Top 10 reviewed</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" />magad30011@gmail.com</li>
            {/* <li className="flex items-center gap-2"><Github className="h-4 w-4" /> github.com/secureshop</li> */}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SecureShop — University Cybersecurity Project. All rights reserved.
      </div>
    </footer>
  );
}
