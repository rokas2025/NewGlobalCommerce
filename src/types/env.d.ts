declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    OPENAI_API_KEY?: string
    NEXTAUTH_SECRET?: string
    NEXTAUTH_URL?: string
  }
}
