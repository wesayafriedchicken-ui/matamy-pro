import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, fallback: string) => {
  if (typeof import.meta !== 'undefined' && import.meta?.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://ldbthhnykxrbpnhuvdxj.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'sb_publishable_38L4KLMsMoKPeDQMCpodRQ_NfxE7Y8Q');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_PROJECT_ID = 'ldbthhnykxrbpnhuvdxj';
export const SUPABASE_SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`;

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  rolesTableExists: boolean;
  usersTableExists: boolean;
  error?: string;
}> {
  try {
    const [ordersRes, rolesRes, usersRes] = await Promise.all([
      supabase.from('orders').select('id').limit(1),
      supabase.from('roles').select('id').limit(1),
      supabase.from('app_users').select('id').limit(1),
    ]);

    const ordersErr = ordersRes.error;
    const rolesTableExists = !rolesRes.error;
    const usersTableExists = !usersRes.error;

    if (!ordersErr && rolesTableExists && usersTableExists) {
      return { connected: true, tablesExist: true, rolesTableExists: true, usersTableExists: true };
    }

    if (!ordersErr && (!rolesTableExists || !usersTableExists)) {
      return {
        connected: true,
        tablesExist: true,
        rolesTableExists,
        usersTableExists,
        error: 'جدولي الأدوار والمستخدمين (roles & app_users) غير منشأة بعد في Supabase',
      };
    }

    // Check if error is because table doesn't exist
    if (ordersErr && (ordersErr.code === 'PGRST205' || ordersErr.message.includes('schema cache'))) {
      return {
        connected: true,
        tablesExist: false,
        rolesTableExists: false,
        usersTableExists: false,
        error: 'جداول قاعدة البيانات غير منشأة بعد في Supabase',
      };
    }

    return {
      connected: false,
      tablesExist: false,
      rolesTableExists: false,
      usersTableExists: false,
      error: ordersErr?.message,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل الاتصال بقاعدة البيانات';
    return {
      connected: false,
      tablesExist: false,
      rolesTableExists: false,
      usersTableExists: false,
      error: message,
    };
  }
}
