import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar, Footer } from './components/Layout'
import { AuthGuard } from './components/AuthGuard'
import { Loader } from './components/UI'

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
const NotFound = lazy(() => import('./pages/AppPages').then(m => ({ default: m.NotFound })))

function App() {
  return (
    <div className="flex flex-col min-h-screen">
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

            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
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
