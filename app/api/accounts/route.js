import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, status, current_user_email, current_machine, session_token')
      .order('id', { ascending: true });

    if (error) throw error;
    
    // Map data to match old format
    const accounts = data.map(acc => ({
      id: acc.id,
      name: acc.name,
      status: acc.status,
      currentUser: acc.current_user_email,
      currentMachine: acc.current_machine,
      sessionToken: acc.session_token
    }));

    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
