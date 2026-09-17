import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ CẢNH BÁO: Thiếu cấu hình Supabase URL hoặc Key. API có thể sẽ không hoạt động trên Vercel nếu biến môi trường chưa được thiết lập đúng.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
