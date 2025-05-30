import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './context/AuthContext'
import Footer from './components/Footer'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Content Briefs Dashboard',
  description: 'Dashboard for viewing and managing content briefs from MongoDB',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="site-wrapper">
            <Navigation />
            <main className="site-main">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
