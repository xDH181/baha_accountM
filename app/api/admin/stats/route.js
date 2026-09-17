import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('status, current_user_email');

    if (error) throw error;

    const totalAccounts = data.length;
    const inUseAccounts = data.filter(a => a.status === 'in-use').length;
    const availableAccounts = totalAccounts - inUseAccounts;
    
    const uniqueUsers = new Set();
    data.forEach(a => {
      if (a.current_user_email) uniqueUsers.add(a.current_user_email);
    });

    const stats = {
      totalAccounts,
      inUseAccounts,
      availableAccounts,
      totalUsers: uniqueUsers.size
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
