// src/lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   */
  server: {
    // Made optional to prevent runtime crash if missing. Application code handles fallbacks.
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    DATABASE_URL: z.string().optional(),
    POSTGRES_URL: z.string().optional(),
    // Add any other server-side variables here
  },

  /**
   * Specify your client-side environment variables schema here.
   */
  client: {
    // Made optional to prevent runtime crash if missing. Application code handles fallbacks.
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  },

  /**
   * Manual destructuring of process.env for edge runtimes
   */
  runtimeEnv: {
    // Server-side
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
    
    // Client-side
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  },
  
  /**
   * Skip validation for build and dev to prevent crashes
   */
  skipValidation: true,
  emptyStringAsUndefined: true,
});
