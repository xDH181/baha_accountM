import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Mã phiên truy cập (token) không được để trống.' }, { status: 400 });
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('session_token', token)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'Liên kết không tồn tại hoặc phiên mượn không hợp lệ.' }, { status: 404 });
    }

    if (account.status !== 'in-use') {
      return NextResponse.json({ error: 'Tài khoản này đã được hoàn trả hoặc phiên đã kết thúc.' }, { status: 410 });
    }

    // Kiểm tra thời hạn
    if (account.rent_expires_at && new Date(account.rent_expires_at) < new Date()) {
      // Tự động thu hồi phiên nếu đã quá hạn
      await supabase
        .from('accounts')
        .update({
          status: 'available',
          current_user_email: null,
          current_machine: null,
          session_token: null,
          rent_expires_at: null
        })
        .eq('id', account.id);

      return NextResponse.json({ error: 'Phiên mượn đã hết hạn sử dụng.' }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        name: account.name,
        accountEmail: account.account_email,
        accountPassword: account.account_password,
        currentUser: account.current_user_email,
        rentExpiresAt: account.rent_expires_at,
        sessionToken: account.session_token
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Cho phép người mượn tự trả tài khoản ngay tại trang access
export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token không hợp lệ.' }, { status: 400 });
    }

    const { data: account, error: findError } = await supabase
      .from('accounts')
      .select('id, status')
      .eq('session_token', token)
      .single();

    if (findError || !account) {
      return NextResponse.json({ error: 'Không tìm thấy phiên mượn.' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        status: 'available',
        current_user_email: null,
        current_machine: null,
        session_token: null,
        rent_expires_at: null
      })
      .eq('id', account.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Đã hoàn trả tài khoản thành công.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
