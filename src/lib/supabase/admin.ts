import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseSecretEnv } from "./env";

export function createAdminClient() {
  const { url, secretKey } = getSupabaseSecretEnv();

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
