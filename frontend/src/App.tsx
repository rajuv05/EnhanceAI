import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar, Footer } from './components/Layout'
import { AuthGuard } from './components/AuthGuard'
import { Loader } from './components/UI'
import ScrollToTop from './components/ScrollToTop'

// Lazy load pages
const Home = lazy(() => import('./pages/AppPages').then(m => ({ default: m.Home })))
const Dashboard = lazy(() => import('./pages/AppPages').then(m => ({ default: m.Dashboard })))
const Features = lazy(() => import('./pages/AppPages').then(m => ({ default: m.Features })))
const Pricing = lazy(() => import('./pages/AppPages').then(m => ({ default: m.Pricing })))
const Login = lazy(() => import('./pages/AppPages').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/AppPages').then(m => ({ default: m.Register })))
const VerifyEmail = lazy(() => import('./pages/AppPages').then(m => ({ default: m.VerifyEmail })))
const History = lazy(() => import('./pages/AppPages').then(m => ({ default: m.History })))
const Settings = lazy(() => import('./pages/AppPages').then(m => ({ default: m.Settings })))
const Admin = lazy(() => import('./pages/AppPages').then(m => ({ default: m.Settings }))) // Reuse settings or create new
const NotFound = lazy(() => import('./pages/AppPages').then(m => ({ default: m.NotFound })))

// Legal Pages
const About = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.About })))
const PrivacyPolicy = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.PrivacyPolicy })))
const TermsOfService = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.TermsOfService })))
const RefundPolicy = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.RefundPolicy })))
const ContactUs = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.ContactUs })))
const FAQ = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.FAQ })))
const CookiePolicy = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.CookiePolicy })))
const DMCA = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.DMCA })))
const AcceptableUse = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.AcceptableUse })))

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Informational & Legal */}
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/acceptable-use" element={<AcceptableUse />} />

            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Settings />} /> {/* Placeholder */}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
