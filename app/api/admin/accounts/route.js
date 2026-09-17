import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    
    // Map data to match old format
    const accounts = data.map(acc => ({
      id: acc.id,
      name: acc.name,
      status: acc.status,
      currentUser: acc.current_user_email,
      currentMachine: acc.current_machine,
      accountEmail: acc.account_email,
      accountPassword: acc.account_password
    }));

    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, accountEmail, accountPassword } = await req.json();
    
    const { data, error } = await supabase
      .from('accounts')
      .insert([
        { name, account_email: accountEmail, account_password: accountPassword, status: 'available' }
      ])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, account: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    const { id, name, accountEmail, accountPassword, action } = await req.json();
    
    if (action === 'forceLogout') {
      const { data, error } = await supabase
        .from('accounts')
        .update({
          status: 'available',
          current_user_email: null,
          current_machine: null,
          session_token: null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ success: true, account: data }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('accounts')
      .update({
        name,
        account_email: accountEmail,
        account_password: accountPassword
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, account: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get('id'));
    
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
