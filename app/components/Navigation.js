'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const pathname = usePathname();
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'DigiTribe';
  const { user, logout } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  return (
    <div className="top-navigation">
      <div className="brand-name">
        <Link href="/">{companyName}</Link>
      </div>
      
      {user ? (
        <>
          <div className="nav-center">
            <Link 
              href="/" 
              className={`nav-item ${pathname === '/' ? 'active' : ''}`}
            >
              Content Briefs
            </Link>
            <Link 
              href="/keywords" 
              className={`nav-item ${pathname === '/keywords' ? 'active' : ''}`}
            >
              Keywords
            </Link>
          </div>
          <div className="nav-right">
            <span>{user.email}</span>
            <span>{user.domain}</span>
            <a href="#" onClick={handleLogout}>Logout</a>
          </div>
        </>
      ) : (
        <div className="nav-right">
          <Link href="/login" className="login-link">Login</Link>
        </div>
      )}
    </div>
  );
};

export default Navigation; 