import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="bg-dark-lighter border-b border-dark-lightest py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">EnhanceAI</Link>
        <div className="flex items-center space-x-6">
          {!isAuthenticated ? (
            <>
              <Link to="/features" className="hover:text-primary transition">Features</Link>
              <Link to="/pricing" className="hover:text-primary transition">Pricing</Link>
              <Link to="/login" className="hover:text-primary transition">Login</Link>
              <Link to="/register" className="bg-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition text-white">Register</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="hover:text-primary transition">Dashboard</Link>
              <Link to="/history" className="hover:text-primary transition">History</Link>
              <Link to="/settings" className="hover:text-primary transition">Settings</Link>
              <button
                onClick={logout}
                className="bg-dark-lightest px-4 py-2 rounded-lg hover:bg-red-900 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export const Footer = () => {
  return (
    <footer className="bg-dark-lighter border-t border-dark-lightest py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} EnhanceAI. All rights reserved.</p>
      </div>
    </footer>
  )
}
