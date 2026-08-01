import { Routes, Route } from 'react-router-dom'
import { Navbar, Footer } from './components/Layout'
import { AuthGuard } from './components/AuthGuard'

import {
  Home,
  Dashboard,
  Features,
  Pricing,
  Login,
  Register,
  History,
  Settings,
  NotFound
} from './pages/AppPages'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
