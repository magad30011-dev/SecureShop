/**
 * SecureShop - Security utilities (educational simulation)
 *
 * In production:
 *  - Hashing must run server-side with bcrypt/argon2 + per-user salt.
 *  - Sessions must use httpOnly + Secure + SameSite cookies signed by the server.
 *  - Logs must be shipped to a SIEM (Splunk, ELK, Datadog) with retention policies.
 *
 * This module demonstrates the CONCEPTS for the university project.
 */

// -------- Password hashing (demo - SHA-256 via Web Crypto) --------
// SAST note: NEVER store plaintext passwords. Use bcrypt/argon2 server-side in production.
export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}::${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// -------- RASP: Runtime Application Self-Protection --------
// Detects common injection patterns in user input.
const ATTACK_PATTERNS: { name: string; regex: RegExp }[] = [
  {
    name: "SQL Injection",
    regex: /(\bunion\b.*\bselect\b|\bor\b\s+1\s*=\s*1|--\s|;\s*drop\s+table)/i,
  },
  { name: "XSS", regex: /<script|javascript:|onerror\s*=|onload\s*=/i },
  { name: "Path Traversal", regex: /\.\.\/|\.\.\\/ },
  { name: "Command Injection", regex: /(\||&&|;|`|\$\()\s*(rm|cat|wget|curl|nc)\b/i },
  { name: "LDAP Injection", regex: /[()&|!*]{2,}/ },
];

export type SecurityEvent = {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "block";
  type: string;
  message: string;
  source?: string;
};

// In-memory log (in production: send to SIEM)
const securityLog: SecurityEvent[] = [
  {
    id: "seed1",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    level: "info",
    type: "AUTH",
    message: "User session validated",
    source: "login",
  },
  {
    id: "seed2",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    level: "warn",
    type: "RATE_LIMIT",
    message: "5 failed login attempts from same source",
    source: "login",
  },
  {
    id: "seed3",
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    level: "block",
    type: "RASP",
    message: "Blocked SQL Injection attempt: ' OR 1=1 --",
    source: "search",
  },
];

const listeners = new Set<() => void>();
export function subscribeLogs(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export function getLogs(): SecurityEvent[] {
  return [...securityLog].reverse();
}

export function logEvent(ev: Omit<SecurityEvent, "id" | "timestamp">) {
  securityLog.push({
    ...ev,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  if (securityLog.length > 200) securityLog.shift();
  listeners.forEach((fn) => fn());
}

/** RASP - inspects input and blocks if malicious. Returns true if SAFE. */
export function raspInspect(input: string, source: string): { safe: boolean; threat?: string } {
  for (const p of ATTACK_PATTERNS) {
    if (p.regex.test(input)) {
      logEvent({
        level: "block",
        type: "RASP",
        message: `Blocked ${p.name} attempt: ${input.slice(0, 60)}`,
        source,
      });
      return { safe: false, threat: p.name };
    }
  }
  return { safe: true };
}

/** Basic HTML escape - defense in depth against XSS when rendering. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
