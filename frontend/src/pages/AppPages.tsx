import React, { useState, useEffect } from 'react'
import { Button, Card, Loader } from '../components/UI'
import { motion } from 'framer-motion'
import { taskService, paymentService, authService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export const Home = () => (
  <div className="container mx-auto px-4 py-20 text-center">
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-6xl font-extrabold mb-6"
    >
      Master Your Media with <span className="text-primary">FFmpeg</span>
    </motion.h1>
    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
      Professional image and video processing. Compress, upscale, and transform your media in seconds using powerful open-source engines.
    </p>
    <div className="flex justify-center gap-4">
      <Button className="text-lg px-8 py-3" onClick={() => window.location.href='/dashboard'}>Get Started</Button>
      <Button variant="outline" className="text-lg px-8 py-3" onClick={() => window.location.href='/pricing'}>View Pricing</Button>
    </div>
  </div>
)

export const Features = () => (
  <div className="container mx-auto px-4 py-20">
    <h2 className="text-4xl font-bold mb-12 text-center">Media Tools</h2>
    <div className="grid md:grid-cols-3 gap-8">
      {[
        { t: 'Video Compression', d: 'Reduce file size without losing quality.' },
        { t: 'Image Optimization', d: 'Speed up your website with optimized assets.' },
        { t: 'Format Conversion', d: 'Convert between any image or video format.' }
      ].map((f) => (
        <Card key={f.t} title={f.t}>
          <p className="text-gray-400">{f.d}</p>
        </Card>
      ))}
    </div>
  </div>
)

export const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: string) => {
    if (plan !== 'Pro') return
    setLoading('Pro')
    try {
      const res = await paymentService.createCheckoutSession()
      window.location.href = res.url
    } catch (err) {
      alert("Failed to initiate checkout")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h2 className="text-4xl font-bold mb-12 text-center">Simple Pricing</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {['Free', 'Pro', 'Enterprise'].map((plan) => (
          <Card key={plan} title={plan} className={`text-center ${plan === 'Pro' ? 'border-primary ring-1 ring-primary' : 'border-primary/20'}`}>
            <div className="text-3xl font-bold mb-4">{plan === 'Free' ? '$0' : plan === 'Pro' ? '$19' : 'Custom'}</div>
            <p className="text-gray-400 mb-6">
              {plan === 'Free' ? 'Basic processing' : plan === 'Pro' ? 'Batch processing & 4K' : 'Custom solutions'}
            </p>
            <Button
              variant={plan === 'Pro' ? 'primary' : 'outline'}
              className="w-full"
              isLoading={loading === plan}
              onClick={() => handleSubscribe(plan)}
            >
              {plan === 'Enterprise' ? 'Contact Us' : plan === 'Free' ? 'Current Plan' : 'Upgrade to Pro'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

const VIDEO_TOOLS = ["compress", "upscale", "sharpen", "brightness", "contrast", "saturation", "fps", "trim", "rotate", "crop", "gif", "extract_audio", "remove_audio"]
const IMAGE_TOOLS = ["resize", "sharpen", "brightness", "contrast", "saturation", "optimize", "convert"]

export const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null)
  const [tool, setTool] = useState("optimize")
  const [isUploading, setIsUploading] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const tasks = await taskService.getTasks();
      setTasks(tasks.reverse());
    } catch (err) {
      console.error("Failed to fetch tasks")
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      await taskService.uploadAndProcess(file, tool)
      setFile(null)
      fetchTasks()
    } catch (err) {
      alert("Processing failed")
    } finally {
      setIsUploading(false)
    }
  }

  const isVideo = file?.type.startsWith('video/')
  const currentTools = isVideo ? VIDEO_TOOLS : IMAGE_TOOLS

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card title="New Task">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-dark-lightest rounded-lg p-10 text-center">
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    setFile(f)
                    if (f?.type.startsWith('video/')) setTool('compress')
                    else setTool('optimize')
                }}
              />
              <label htmlFor="fileInput" className="cursor-pointer block">
                <p className="text-gray-400">
                  {file ? `Selected: ${file.name}` : "Click to select image or video"}
                </p>
              </label>
            </div>

            {file && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Tool</label>
                <select
                  className="w-full bg-dark border border-dark-lightest rounded p-3 capitalize"
                  value={tool}
                  onChange={(e) => setTool(e.target.value)}
                >
                  {currentTools.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
            )}

            <Button
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={!file}
              className="w-full"
            >
              Start Processing
            </Button>
          </div>
        </Card>

        <Card title="Task History">
          {tasks.length === 0 ? (
            <p className="text-gray-400">No activity yet.</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {tasks.map((task) => (
                <div key={task.id} className="border-b border-dark-lightest pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium truncate max-w-[200px]">{task.filename}</div>
                      <div className="text-xs text-gray-500 capitalize">{task.tool.replace('_', ' ')} • {task.file_type}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                        task.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                        task.status === 'failed' ? 'bg-red-900/50 text-red-400' :
                        'bg-blue-900/50 text-blue-400'
                      }`}>
                        {task.status}
                      </span>
                      {task.status === 'completed' && (
                        <a
                          href={`http://localhost:8000/${task.enhanced_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                  {task.processing_time && (
                    <div className="text-[10px] text-gray-500">
                      Processed in {task.processing_time.toFixed(2)}s
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export const History = () => (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Full History</h1>
      <Card>
        <p className="text-gray-400">View and manage all your past media transformations here.</p>
      </Card>
    </div>
)

export const Settings = () => {
  const { user, logout } = useAuth()

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      <div className="max-w-2xl">
        <Card title="Profile">
          <div className="space-y-4 text-gray-400">
              <p>Email: <span className="text-white">{user?.email}</span></p>
              <p>Name: <span className="text-white">{user?.full_name}</span></p>
              <p>Membership: <span className="text-primary font-bold">{user?.is_pro ? 'Pro Plan' : 'Free Plan'}</span></p>
              <Button variant="outline" onClick={logout}>Sign Out</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      login(res.access_token);
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <Card title="Login" className="w-full max-w-md">
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-dark border border-dark-lightest rounded p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-dark border border-dark-lightest rounded p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" onClick={handleLogin} isLoading={loading}>Sign In</Button>
        </div>
      </Card>
    </div>
  )
}

export const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  const handleRegister = async () => {
    setLoading(true)
    try {
      await authService.register(form)
      alert("Success! Please login.")
      window.location.href = '/login'
    } catch (err) {
      alert("Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <Card title="Create Account" className="w-full max-w-md">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-dark border border-dark-lightest rounded p-3"
            value={form.full_name}
            onChange={(e) => setForm({...form, full_name: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-dark border border-dark-lightest rounded p-3"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-dark border border-dark-lightest rounded p-3"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
          />
          <Button className="w-full" onClick={handleRegister} isLoading={loading}>Register</Button>
        </div>
      </Card>
    </div>
  )
}

export const NotFound = () => (
  <div className="container mx-auto px-4 py-20 text-center">
    <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
    <p className="text-2xl mb-8">Page not found</p>
    <Button onClick={() => window.location.href = '/'}>Go Home</Button>
  </div>
)
