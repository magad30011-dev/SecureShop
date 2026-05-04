import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "./security";

export type Role = "admin" | "user";

export type User = {
  id: string;
  email: string;
  role: Role;
};

type AuthResult = {
  ok: boolean;
  error?: string;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const GENERIC_ERROR = "البيانات المدخلة خاطئة";

export type AdminUserView = {
  id: string;
  email: string;
  role: Role;
};

async function loadUserFromSession(session: Session | null): Promise<User | null> {
  if (!session?.user) return null;

  let retries = 3;
  while (retries > 0) {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error && error.code === "429") {
        await new Promise((res) => setTimeout(res, 1000));
        retries--;
        continue;
      }

      if (error) {
        console.error("role error:", error);
      }

      const role: Role = (data?.role as Role) ?? "user";

      return {
        id: session.user.id,
        email: session.user.email ?? "",
        role,
      };
    } catch (err) {
      console.error("loadUserFromSession failed:", err);
      await new Promise((res) => setTimeout(res, 1000));
      retries--;
    }
  }

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    role: "user",
  };
}

export async function adminListUsers(): Promise<AdminUserView[]> {
  let retries = 3;
  while (retries > 0) {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email")
        .order("created_at", { ascending: true });

      if (error && error.code === "429") {
        await new Promise((res) => setTimeout(res, 1000));
        retries--;
        continue;
      }

      if (error || !profiles) return [];

      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("user_id, role");

      if (rolesError && rolesError.code === "429") {
        await new Promise((res) => setTimeout(res, 1000));
        retries--;
        continue;
      }

      const roleMap = new Map<string, Role>();

      (roles ?? []).forEach((r: any) => {
        roleMap.set(r.user_id, r.role as Role);
      });

      return profiles.map((p: any) => ({
        id: p.id,
        email: p.email,
        role: roleMap.get(p.id) ?? "user",
      }));
    } catch (err) {
      console.error("adminListUsers failed:", err);
      await new Promise((res) => setTimeout(res, 1000));
      retries--;
    }
  }
  return [];
}

export async function adminSendPasswordReset(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    logEvent({
      level: "warn",
      type: "ADMIN",
      message: `Password reset failed for ${email}`,
      source: "admin",
    });

    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

export async function adminChangeOwnPassword(newPassword: string): Promise<AuthResult> {
  if (!newPassword || newPassword.length < 8) {
    return {
      ok: false,
      error: "Password must be at least 8 characters",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const current = await loadUserFromSession(data.session);

        if (mounted) {
          setUser(current);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const current = await loadUserFromSession(session);

      if (mounted) {
        setUser(current);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login: AuthCtx["login"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logEvent({
        level: "warn",
        type: "AUTH",
        message: `Failed login for ${email}`,
        source: "login",
      });

      return {
        ok: false,
        error: GENERIC_ERROR,
      };
    }

    return { ok: true };
  };

  const register: AuthCtx["register"] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      return {
        ok: false,
        error: GENERIC_ERROR,
      };
    }

    return { ok: true };
  };

  const loginWithGoogle: AuthCtx["loginWithGoogle"] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      return {
        ok: false,
        error: "Google login failed",
      };
    }

    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
