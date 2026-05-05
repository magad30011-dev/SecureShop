import { supabase } from "@/integrations/supabase/client";

/* ========= 1. Detection ========= */
function normalize(input: string) {
  try {
    return decodeURIComponent(input).toLowerCase();
  } catch {
    return input.toLowerCase();
  }
}

const PATTERNS: RegExp[] = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /<\s*img[^>]+onerror\s*=/i,
  /on\w+\s*=/i,                 // onload=, onclick=...
  /javascript\s*:/i,
  /alert\s*\(/i,
  /<[^>]+>/i,                  // أي HTML
  /union\s+select/i,
  /select\s+.+\s+from/i,
  /drop\s+table/i,
  /--/g,
];

function detect(input: string) {
  const value = normalize(input);
  for (const p of PATTERNS) {
    if (p.test(value)) {
      return { safe: false, threat: "Malicious pattern detected" };
    }
  }
  return { safe: true };
}

/* ========= 2. Logging ========= */
async function logEvent(input: string, threat: string, source: string) {
  try {
    await supabase.from("security_logs").insert({
      type: "RASP",
      input,
      threat,
      page: source,
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("RASP LOG ERROR:", e);
  }
}

/* ========= 3. Main Guard ========= */
export async function raspGuard(input: string, source = "unknown") {
  if (!input) return { allow: true };

  const res = detect(input);

  if (!res.safe) {
    await logEvent(input, res.threat || "Blocked", source);
    return { allow: false, threat: res.threat };
  }

  return { allow: true };
}

/* ========= 4. URL Protection ========= */
export async function protectURL(source = "url") {
  const params = new URLSearchParams(window.location.search);

  for (const [key, value] of params.entries()) {
    const check = await raspGuard(value, source);

    if (!check.allow) {
      console.warn("🚨 Blocked URL attack:", value);

      // حذف البارامتر من الرابط
      window.history.replaceState({}, "", window.location.pathname);

      return { blocked: true, threat: check.threat };
    }
  }

  return { blocked: false };
}