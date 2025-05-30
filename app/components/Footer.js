'use client';

import Link from 'next/link';

const Footer = () => {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'DigiTribe';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link href="/">{companyName}</Link>
        </div>
        <div className="footer-tagline">
          Your partner for digital growth across Europe.
        </div>
        <div className="footer-links">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span className="divider">|</span>
          <Link href="/terms-of-service">Terms of Service</Link>
          <span className="divider">|</span>
          <Link href="/cookie-policy">Cookie Policy</Link>
        </div>
        <div className="footer-copyright">
          &copy; {currentYear} {companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 