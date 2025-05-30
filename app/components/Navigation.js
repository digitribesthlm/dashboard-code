'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path ? 'nav-link active' : 'nav-link';
  };
  
  return (
    <nav className="main-navigation">
      <ul className="nav-links">
        <li>
          <Link href="/" className={isActive('/')}>
            Content Briefs
          </Link>
        </li>
        <li>
          <Link href="/keywords" className={isActive('/keywords')}>
            Keywords
          </Link>
        </li>
      </ul>
    </nav>
  );
} 