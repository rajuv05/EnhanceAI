import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, LayoutDashboard, History, Settings, CreditCard, ChevronDown } from 'lucide-react'

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  const navLinks = !isAuthenticated
    ? [
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
      ]
    : []

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    setIsOpen(false)
  }

  return (
    <nav className="bg-dark-lighter border-b border-dark-lightest sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center">
          EnhanceAI
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.href} className="text-gray-300 hover:text-primary transition font-medium">
              {link.name}
            </Link>
          ))}

          {!isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-primary transition font-medium">Login</Link>
              <Link to="/register" className="bg-primary px-5 py-2 rounded-lg hover:bg-primary-dark transition text-white font-bold">
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 bg-dark-lightest hover:bg-dark-lightest/80 p-1 pr-3 rounded-full transition border border-dark-lightest"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-200">{user?.full_name?.split(' ')[0]}</span>
                <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-dark-lighter border border-dark-lightest rounded-xl shadow-2xl py-2 z-50"
                  >
                    <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-2 hover:bg-dark-lightest text-gray-300 transition">
                      <LayoutDashboard size={18} /> <span>Dashboard</span>
                    </Link>
                    <Link to="/history" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-2 hover:bg-dark-lightest text-gray-300 transition">
                      <History size={18} /> <span>History</span>
                    </Link>
                    <Link to="/settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-2 hover:bg-dark-lightest text-gray-300 transition">
                      <Settings size={18} /> <span>Settings</span>
                    </Link>
                    <Link to="/pricing" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-2 hover:bg-dark-lightest text-gray-300 transition">
                      <CreditCard size={18} /> <span>Upgrade</span>
                    </Link>
                    <hr className="border-dark-lightest my-2" />
                    <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-2 hover:bg-red-900/20 text-red-400 w-full text-left transition">
                      <LogOut size={18} /> <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-300" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-dark-lighter border-t border-dark-lightest overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              {isAuthenticated && (
                <div className="flex items-center space-x-3 p-2 bg-dark-lightest rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white">{user?.full_name || 'User'}</div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
                </div>
              )}

              {navLinks.map((link) => (
                <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)} className="text-lg text-gray-300 font-medium">
                  {link.name}
                </Link>
              ))}

              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg text-gray-300 font-medium">Login</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="bg-primary text-center py-3 rounded-lg font-bold text-white">Register</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg text-gray-300 font-medium">Dashboard</Link>
                  <Link to="/history" onClick={() => setIsOpen(false)} className="text-lg text-gray-300 font-medium">History</Link>
                  <Link to="/settings" onClick={() => setIsOpen(false)} className="text-lg text-gray-300 font-medium">Settings</Link>
                  <Link to="/pricing" onClick={() => setIsOpen(false)} className="text-lg text-gray-300 font-medium">Upgrade</Link>
                  <button onClick={handleLogout} className="text-lg text-red-400 font-medium text-left">Logout</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const Toast = () => {
  const { toast, clearToast } = useAuth()

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className={`fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border ${
            toast.type === 'success' ? 'bg-green-950 border-green-800 text-green-400' : 'bg-red-950 border-red-800 text-red-400'
          }`}
        >
          <span className="font-medium">{toast.message}</span>
          <button onClick={clearToast} className="hover:opacity-70"><X size={18} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-lighter border-t border-dark-lightest pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
             <Link to="/" className="text-2xl font-black text-primary mb-6 block tracking-tighter">EnhanceAI</Link>
             <p className="text-gray-500 font-medium leading-relaxed mb-6">
               Professional-grade media tools for designers, developers, and creators.
               Fast, secure, and powered by high-performance cloud engines.
             </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Support & Legal</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Resources</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link to="/dmca" className="hover:text-primary transition-colors">DMCA Policy</Link></li>
              <li><Link to="/acceptable-use" className="hover:text-primary transition-colors">Acceptable Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-lightest pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 font-bold text-xs uppercase tracking-widest">
            &copy; {currentYear} EnhanceAI. All rights reserved.
          </p>
          <div className="flex space-x-6">
             <a href="#" className="text-gray-600 hover:text-white transition-colors"><Mail size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
