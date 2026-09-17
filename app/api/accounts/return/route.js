import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { id, user } = await req.json();

    // Fetch account to verify ownership
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('status, current_user_email')
      .eq('id', id)
      .single();

    if (fetchError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.status === 'available') {
      return NextResponse.json({ error: 'Account is already available' }, { status: 400 });
    }

    if (account.current_user_email !== user && user !== 'admin@admin.com' && user !== 'admin@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized to return this account' }, { status: 403 });
    }

    // Update
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        status: 'available',
        current_user_email: null,
        current_machine: null,
        session_token: null
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
