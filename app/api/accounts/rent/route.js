import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { id, user, machine } = await req.json();

    // Check if available
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.status === 'in-use') {
      return NextResponse.json({ error: 'Account is already in use' }, { status: 400 });
    }

    const sessionToken = `session_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}_${id}`;
    // Thời hạn mượn 2 tiếng
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    // Update
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        status: 'in-use',
        current_user_email: user,
        current_machine: machine,
        session_token: sessionToken,
        rent_expires_at: expiresAt
      })
      .eq('id', id);

    if (updateError) throw updateError;

    const origin = req.headers.get('origin') || '';
    const accessUrl = `${origin}/access?token=${sessionToken}`;

    return NextResponse.json({ 
      sessionToken, 
      accessUrl, 
      expiresAt 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
