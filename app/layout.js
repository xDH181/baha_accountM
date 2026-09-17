import './globals.css';

import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Hệ thống Quản lý Tài khoản',
  description: 'Nền tảng cho thuê và quản lý tài khoản bảo mật',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Navbar />
        {children}
        <footer className="footer">
          <p>© 2026 AccRent Pro. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
