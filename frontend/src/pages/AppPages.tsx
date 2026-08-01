import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button, Card, Loader, Input, Badge, Skeleton } from '../components/UI'
import { UpgradeModal } from '../components/SubscriptionModals'
import { AdBanner } from '../components/AdBanner'
import { motion, AnimatePresence } from 'framer-motion'
import { taskService, paymentService, authService, usageService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Navigate, useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  Download, Trash2, Clock, HardDrive, FileText, CheckCircle,
  AlertCircle, Upload, ChevronRight, Search, Filter,
  ArrowRight, Sparkles, Image as ImageIcon, Video as VideoIcon,
  Activity, X, CreditCard, ExternalLink
} from 'lucide-react'

// --- Helpers ---
const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getToolName = (tool: string) => tool?.replace('_', ' ') || 'Process';

const VIDEO_TOOLS = ["compress", "resize", "upscale", "brightness", "contrast", "saturation", "sharpen", "trim", "crop", "rotate", "fps", "convert", "extract_audio", "remove_audio", "gif", "watermark", "thumbnail"]
const IMAGE_TOOLS = ["resize", "sharpen", "brightness", "contrast", "saturation", "optimize", "convert", "crop", "rotate", "flip", "blur", "watermark"]

// --- Components ---

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
)

export const Home = () => {
  const navigate = useNavigate()
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 p-3 px-6 bg-primary/10 rounded-full border border-primary/20 flex items-center space-x-2"
        >
          <Sparkles size={18} className="text-primary" />
          <span className="text-primary font-bold text-sm tracking-wide uppercase">New: FFmpeg Powered Engine</span>
        </motion.div>

        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter text-center max-w-4xl">
          Transform your media <br />
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">with precision.</span>
        </h1>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto text-center font-medium leading-relaxed">
          Professional image and video processing. Compress, upscale, and transform your media in seconds using powerful open-source engines.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-md px-4">
          <Button size="lg" className="w-full sm:w-auto min-w-[200px]" onClick={() => navigate('/dashboard')}>
            Launch Dashboard <ChevronRight className="ml-2" size={20} />
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[200px]" onClick={() => navigate('/pricing')}>
            View Pricing
          </Button>
        </div>

        <AdBanner position="home" className="mt-20 max-w-4xl" />

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:opacity-100 transition-all duration-500">
           <div className="font-black text-2xl tracking-tighter">FFMPEG</div>
           <div className="font-black text-2xl tracking-tighter italic">PILLOW</div>
           <div className="font-black text-2xl tracking-tighter">POSTGRES</div>
           <div className="font-black text-2xl tracking-tighter italic">REDIS</div>
        </div>
      </div>
    </PageTransition>
  )
}

export const Features = () => (
  <PageTransition>
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Everything you need.</h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">A comprehensive suite of media tools for professionals.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { t: 'High-Speed Compression', d: 'Reduce video size by up to 80% with H.264 optimization.', icon: <HardDrive size={24}/> },
          { t: 'Pro Upscaling', d: 'Upscale your footage to 4K using advanced Lanczos interpolation.', icon: <Sparkles size={24}/> },
          { t: 'Audio Extraction', d: 'Pull crystal clear high-bitrate MP3 audio from any video file.', icon: <FileText size={24}/> },
          { t: 'Image Processing', d: 'Sharpen, resize, and optimize images for the web in bulk.', icon: <ImageIcon size={24}/> },
          { t: 'GIF Generation', d: 'Convert video clips into high-quality animated GIFs instantly.', icon: <Activity size={24}/> },
          { t: 'Precise Trimming', d: 'Frame-accurate video trimming and cutting with FFmpeg.', icon: <Clock size={24}/> }
        ].map((f, i) => (
          <Card key={f.t} className="group cursor-default">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.t}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{f.d}</p>
          </Card>
        ))}
      </div>
    </div>
  </PageTransition>
)

export const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null)
  const { user, showToast } = useAuth()

  const handleSubscribe = async (plan: string) => {
    if (plan === 'Free') return
    const planKey = plan.toLowerCase()
    setLoading(planKey)
    try {
      const order = await paymentService.createOrder(planKey)

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "EnhanceAI",
        description: `${plan} Plan Subscription`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )
            showToast("Payment Successful!", "success")
            window.location.reload()
          } catch (err) {
            showToast("Verification failed", "error")
          }
        },
        prefill: {
          name: user?.full_name,
          email: user?.email,
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to initiate checkout", "error")
    } finally {
      setLoading(null)
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Simple, transparent <br/><span className="text-primary">pricing.</span></h2>
          <p className="text-gray-500 text-lg">No hidden fees. Upgrade or cancel at any time.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { n: 'Free', p: '₹0', d: 'Essential tools for casual creators.', f: ['10 tasks / day', '100MB max file size', 'Standard processing speed', 'Watermark included'] },
            { n: 'Pro', p: '₹29', s: '/month', d: 'Power users and professionals.', f: ['Unlimited tasks', '2GB max file size', 'Priority processing', 'No watermarks', 'Customer Portal access'], popular: true },
            { n: 'Lifetime', p: '₹499', d: 'One-time payment, permanent access.', f: ['Everything in Pro', 'Pay once, use forever', 'Early access to AI tools', 'Priority support'] }
          ].map((plan) => {
            const isCurrent = user?.subscription_plan === plan.n.toLowerCase()
            return (
              <Card key={plan.n} className={plan.popular ? 'border-primary ring-2 ring-primary ring-offset-8 ring-offset-dark scale-105 z-10' : ''}>
                {plan.popular && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">Most Popular</div>}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-400 mb-2">{plan.n}</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-white">{plan.p}</span>
                    {plan.s && <span className="text-gray-500 ml-2 font-bold uppercase tracking-widest text-xs">{plan.s}</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-4 font-medium">{plan.d}</p>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.f.map(feature => (
                    <li key={feature} className="flex items-center text-sm font-semibold text-gray-300">
                      <CheckCircle className="text-primary mr-3 shrink-0" size={18} /> {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                  isLoading={loading === plan.n.toLowerCase()}
                  disabled={isCurrent}
                  onClick={() => handleSubscribe(plan.n)}
                >
                  {isCurrent ? 'Current Plan' : plan.n === 'Free' ? 'Choose Free' : `Upgrade to ${plan.n}`}
                </Button>
              </Card>
            )
          })}
        </div>

        <div className="mt-20 max-w-4xl mx-auto">
           <AdBanner position="pricing" />
        </div>
      </div>
    </PageTransition>
  )
}

// --- Dashboard ---

export const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null)
  const [tool, setTool] = useState("optimize")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState<'uploading' | 'analyzing' | 'processing' | 'finalizing' | 'completed' | 'idle'>('idle')
  const [tasks, setTasks] = useState<any[]>([])
  const [lastTask, setLastTask] = useState<any>(null)
  const [usage, setUsage] = useState<any>(null)
  const [upgradeReason, setUpgradeReason] = useState<string>("")
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)

  const { user, showToast } = useAuth()
  const navigate = useNavigate()

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data.reverse());
    } catch (err) {
      console.error("Failed to fetch tasks")
    }
  }

  const fetchUsage = async () => {
    try {
      const data = await usageService.getUsage()
      setUsage(data)
    } catch (err) {
      console.error("Failed to fetch usage")
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchUsage()
  }, [])

  const handleUpload = async () => {
    if (!file) return

    // 1. Client-side validation for free users
    const isPro = user?.is_pro || user?.subscription_plan !== "free"

    if (!isPro) {
       if (file.size > 100 * 1024 * 1024) {
          setUpgradeReason("Free plan is limited to 100MB per file.")
          setIsUpgradeModalOpen(true)
          return
       }
       if (usage && usage.count_today >= 10) {
          setUpgradeReason("You've reached your daily limit of 10 processing tasks.")
          setIsUpgradeModalOpen(true)
          return
       }
    }

    setIsProcessing(true)
    setProcessingStage('uploading')

    const stageTimer = (stage: any, delay: number) => new Promise(res => setTimeout(() => { setProcessingStage(stage); res(null); }, delay));

    try {
      const uploadPromise = taskService.uploadAndProcess(file, tool);
      await stageTimer('analyzing', 800);
      setProcessingStage('processing');
      const res = await uploadPromise;

      if (res.status === 'failed') {
         setProcessingStage('idle');
         showToast(res.error_message || "Processing failed", "error");
      } else {
         setProcessingStage('finalizing');
         await stageTimer('completed', 500);
         setLastTask(res);
         showToast("Success!", "success");
      }

      setFile(null);
      fetchTasks();
      fetchUsage();
    } catch (err: any) {
      setProcessingStage('idle');
      if (err.response?.status === 403) {
         setUpgradeReason(err.response?.data?.detail)
         setIsUpgradeModalOpen(true)
      } else {
         showToast(err.response?.data?.detail || "Processing failed", "error")
      }
    } finally {
      setIsProcessing(false);
    }
  }

  const handleUpgrade = async (plan: string) => {
    setPaymentLoading(plan)
    try {
      const order = await paymentService.createOrder(plan)

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "EnhanceAI",
        description: `${plan} Plan Upgrade`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )
            showToast("Upgrade Successful!", "success")
            window.location.reload()
          } catch (err) {
            showToast("Verification failed", "error")
          }
        },
        prefill: {
          name: user?.full_name,
          email: user?.email,
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showToast("Payment failed to initialize", "error")
    } finally {
      setPaymentLoading(null)
    }
  }

  const isVideo = file?.type.startsWith('video/')
  const currentTools = isVideo ? VIDEO_TOOLS : IMAGE_TOOLS

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          onUpgrade={handleUpgrade}
          onRewardSuccess={fetchUsage}
          loading={paymentLoading}
          reason={upgradeReason}
        />

        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">Workstation</h1>
            <p className="text-gray-500 font-medium">Manage and process your media assets with full precision.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-dark-lighter border border-dark-lightest p-4 px-8 rounded-2xl flex flex-col items-center min-w-[140px]">
                <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Today's Usage</span>
                <span className="text-2xl font-black text-primary">{usage?.count_today || 0} / {usage?.limit === 999999 ? '∞' : 10}</span>
             </div>
             <div className="bg-dark-lighter border border-dark-lightest p-4 px-8 rounded-2xl flex flex-col items-center min-w-[140px]">
                <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Total Runs</span>
                <span className="text-2xl font-black text-white">{usage?.total_count || 0}</span>
             </div>
          </div>
        </header>

        <AdBanner position="dashboard" className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-8">
            <Card title="New Asset" subtitle="Select a file to begin transformation">
              <div className="space-y-8">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="py-20 flex flex-col items-center justify-center bg-primary/5 rounded-2xl border-2 border-primary/20 border-dashed"
                    >
                      <div className="relative mb-8">
                         <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="text-primary" size={32} />
                         </div>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 capitalize tracking-tight">{processingStage}...</h3>
                      <p className="text-gray-500 font-medium animate-pulse">This usually takes a few seconds.</p>

                      <div className="w-full max-w-sm mt-8 bg-dark h-2 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{
                            width: processingStage === 'uploading' ? '25%' :
                                   processingStage === 'analyzing' ? '50%' :
                                   processingStage === 'processing' ? '80%' : '100%'
                          }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </motion.div>
                  ) : lastTask && processingStage === 'completed' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/5 border-2 border-green-500/20 border-dashed rounded-2xl p-10 flex flex-col items-center"
                    >
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-green-500/30">
                        <CheckCircle size={32} strokeWidth={3} />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">Processing Complete</h3>
                      <p className="text-gray-500 font-medium mb-10">Your file is ready for download.</p>

                      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10 text-center">
                        <div className="bg-dark p-4 rounded-xl border border-dark-lightest">
                          <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Efficiency</span>
                          <span className="text-lg font-black text-green-400">
                             -{Math.abs(((lastTask.original_size - lastTask.enhanced_size) / lastTask.original_size) * 100).toFixed(1)}%
                          </span>
                          <p className="text-[10px] text-gray-500 mt-1">{formatBytes(lastTask.original_size)} → {formatBytes(lastTask.enhanced_size)}</p>
                        </div>
                        <div className="bg-dark p-4 rounded-xl border border-dark-lightest">
                          <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Speed</span>
                          <span className="text-lg font-black text-white">{lastTask.processing_time?.toFixed(2)}s</span>
                          <p className="text-[10px] text-gray-500 mt-1 capitalize">{lastTask.tool}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 w-full max-w-md">
                        <a
                          href={`http://localhost:8000/${lastTask.enhanced_path}`}
                          className="flex-1 h-14 bg-primary text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition"
                        >
                          <Download size={20} /> <span>Download Now</span>
                        </a>
                        <Button variant="secondary" className="flex-1" onClick={() => setProcessingStage('idle')}>
                          Start Another
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div
                        className={`group relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                          file ? 'border-primary/50 bg-primary/5' : 'border-dark-lightest hover:border-primary/30 hover:bg-dark-lightest/30'
                        }`}
                      >
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
                          {file ? (
                            <div className="flex flex-col items-center">
                               <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-4">
                                  {isVideo ? <VideoIcon size={32} /> : <ImageIcon size={32} />}
                               </div>
                               <p className="text-white font-bold text-lg mb-1">{file.name}</p>
                               <p className="text-gray-500 font-medium">{formatBytes(file.size)}</p>
                               <button
                                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                                  className="mt-6 text-sm font-bold text-gray-500 hover:text-red-400 flex items-center transition"
                                >
                                 <X size={14} className="mr-1" /> Remove File
                               </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center py-4">
                               <div className="w-16 h-16 bg-dark-lightest rounded-2xl flex items-center justify-center text-gray-500 mb-6 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                  <Upload size={32} />
                               </div>
                               <p className="text-gray-300 font-bold text-xl mb-2">Drop your asset here</p>
                               <p className="text-gray-500 font-medium">Support for MP4, MOV, PNG, JPG, WebP (Max 2GB)</p>
                            </div>
                          )}
                        </label>
                      </div>

                      {file && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                          {user?.subscription_plan === 'free' && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center space-x-2">
                              <AlertCircle size={16} className="text-orange-400" />
                              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Free Plan: Watermark will be applied</span>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Choose Tool</label>
                              <select
                                className="w-full h-14 bg-dark border border-dark-lightest rounded-xl p-4 capitalize text-white font-bold outline-none focus:border-primary transition appearance-none"
                                value={tool}
                                onChange={(e) => setTool(e.target.value)}
                              >
                                {currentTools.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                              </select>
                            </div>
                            <div className="flex flex-col justify-end">
                               <Button onClick={handleUpload} size="lg" className="w-full">
                                 Begin Transformation
                               </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card title="Quick History" noPadding>
              <div className="divide-y divide-dark-lightest">
                {tasks.length === 0 ? (
                  <div className="py-20 text-center px-6">
                    <p className="text-gray-500 font-medium italic">No recent activity detected.</p>
                  </div>
                ) : (
                  tasks.slice(0, 6).map((task) => (
                    <div key={task.id} className="p-5 flex items-center justify-between group hover:bg-dark-lightest/20 transition-colors">
                      <div className="flex items-center space-x-4 min-w-0">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                            task.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                         }`}>
                            {task.file_type === 'video' ? <VideoIcon size={20}/> : <ImageIcon size={20}/>}
                         </div>
                         <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{task.filename}</h4>
                            <div className="flex flex-col space-y-1 mt-1">
                               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                                  {getToolName(task.tool)} <ChevronRight size={10} className="mx-1" /> {task.status}
                               </p>
                               {task.status === 'completed' && (
                                  <p className="text-[10px] font-medium text-primary">
                                     {formatBytes(task.original_size)} → {formatBytes(task.enhanced_size)}
                                  </p>
                               )}
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center">
                         {task.status === 'completed' && (
                            <a
                              href={`http://localhost:8000/${task.enhanced_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-primary hover:bg-primary/10 transition"
                            >
                               <Download size={18} />
                            </a>
                         )}
                         <Link to="/history" className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-white transition">
                            <ChevronRight size={20} />
                         </Link>
                      </div>
                    </div>
                  ))
                )}
                {tasks.length > 0 && (
                  <Link to="/history" className="block py-4 text-center text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/5 transition">
                    View Complete History
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

// --- History Page ---

export const History = () => {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchBox] = useState("")
  const [filter, setFilter] = useState("all")
  const { showToast } = useAuth()

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks()
      setTasks(data.reverse())
    } catch (err) {
      console.error("Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await taskService.deleteTask(id)
      setTasks(tasks.filter(t => t.id !== id))
      showToast("Record purged", "success")
    } catch (err) {
      showToast("Delete failed", "error")
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const filename = t.filename || ""
      const matchesSearch = filename.toLowerCase().includes(searchTerm.toLowerCase())
      if (filter === 'all') return matchesSearch
      if (filter === 'completed') return matchesSearch && t.status === 'completed'
      if (filter === 'video') return matchesSearch && t.file_type === 'video'
      if (filter === 'image') return matchesSearch && t.file_type === 'image'
      return matchesSearch
    })
  }, [tasks, searchTerm, filter])

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">History</h1>
            <p className="text-gray-500 font-medium">Audit logs of all your processed media files.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
              <Input
                className="pl-12 w-full sm:w-64"
                placeholder="Search filenames..."
                value={searchTerm}
                onChange={(e) => setSearchBox(e.target.value)}
              />
            </div>
            <select
              className="h-12 px-6 bg-dark-lighter border border-dark-lightest rounded-xl text-white font-bold outline-none focus:border-primary transition-all appearance-none cursor-pointer min-w-[140px]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
               <option value="all">All Files</option>
               <option value="completed">Completed</option>
               <option value="video">Videos</option>
               <option value="image">Images</option>
            </select>
          </div>
        </div>

        <AdBanner position="history" className="mb-8" />

        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-lightest/10">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-dark-lightest">Asset</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-dark-lightest hidden sm:table-cell">Tool</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-dark-lightest hidden lg:table-cell">Metrics</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-dark-lightest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-dark-lightest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lightest">
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                         <td className="px-6 py-6"><Skeleton className="h-10 w-48" /></td>
                         <td className="px-6 py-6 hidden sm:table-cell"><Skeleton className="h-4 w-24" /></td>
                         <td className="px-6 py-6 hidden lg:table-cell"><Skeleton className="h-4 w-32" /></td>
                         <td className="px-6 py-6"><Skeleton className="h-6 w-20" /></td>
                         <td className="px-6 py-6"><div className="flex justify-end"><Skeleton className="h-8 w-8 rounded-full" /></div></td>
                      </tr>
                   ))
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                       <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-dark-lightest/50 rounded-2xl flex items-center justify-center text-gray-600 mb-4">
                             <Filter size={32} />
                          </div>
                          <p className="text-gray-500 font-bold">No records match your criteria.</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <motion.tr
                      layout
                      key={task.id}
                      className="hover:bg-dark-lightest/10 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-xl bg-dark border border-dark-lightest flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                              {task.file_type === 'video' ? <VideoIcon size={20} /> : <ImageIcon size={20} />}
                           </div>
                           <div className="min-w-0">
                              <div className="font-bold text-white truncate max-w-[200px]">{task.filename}</div>
                              <div className="flex flex-wrap items-center gap-x-2 mt-1">
                                 <span className="text-[10px] text-gray-500 font-bold">{new Date(task.created_at).toLocaleDateString()}</span>
                                 {task.status === 'completed' && (
                                    <span className="text-[10px] font-bold text-primary">
                                       • {formatBytes(task.original_size)} → {formatBytes(task.enhanced_size)}
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden sm:table-cell">
                        <Badge variant="primary">{getToolName(task.tool)}</Badge>
                      </td>
                      <td className="px-6 py-5 hidden lg:table-cell">
                        {task.status === 'completed' ? (
                          <div className="text-[10px] font-black space-y-1">
                             <div className="text-gray-300">
                                {task.original_resolution && task.enhanced_resolution ? `${task.original_resolution} → ${task.enhanced_resolution}` : task.output_format}
                             </div>
                             <div className="text-primary">{task.processing_time?.toFixed(2)}s runtime</div>
                          </div>
                        ) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant={task.status === 'completed' ? 'success' : task.status === 'failed' ? 'danger' : 'warning'}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end items-center space-x-2">
                           {task.status === 'completed' && (
                             <a
                               href={`http://localhost:8000/${task.enhanced_path}`}
                               target="_blank"
                               rel="noreferrer"
                               className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition shadow-sm"
                               title="Download"
                             >
                                <Download size={18} />
                             </a>
                           )}
                           <button
                            onClick={() => handleDelete(task.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition"
                            title="Delete"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}

// --- Auth Pages ---

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)
  const { login, isAuthenticated, showToast } = useAuth()

  if (isAuthenticated) return <Navigate to="/dashboard" />

  const handleLogin = async () => {
    setLoading(true);
    setUnverified(false);
    try {
      const res = await authService.login(email, password);
      login(res.access_token);
      showToast("Welcome back!", "success")
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.detail === "Email not verified") {
        setUnverified(true);
      } else {
        showToast(err.response?.data?.detail || "Login failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true)
    try {
      await authService.resendVerification(email)
      showToast("Verification email sent", "success")
    } catch (err: any) {
      showToast("Failed to resend email", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card title="Login" subtitle="Secure access to your media lab" className="w-full max-w-md">
          <div className="space-y-6">
            {unverified && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl text-sm font-semibold">
                Please verify your email before logging in.
                <button onClick={handleResend} className="block mt-2 underline hover:no-underline">Resend verification email</button>
              </motion.div>
            )}
            <div>
               <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
               <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
               <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Password</label>
               <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleLogin} isLoading={loading}>
              Sign In
            </Button>
            <p className="text-center text-gray-500 text-sm font-medium">
              Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create one</Link>
            </p>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}

export const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, showToast } = useAuth()

  if (isAuthenticated) return <Navigate to="/dashboard" />

  const handleRegister = async () => {
    setLoading(true)
    try {
      await authService.register(form)
      showToast("Account created! Check your email.", "success")
      window.location.href = '/login'
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Registration failed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card title="Register" subtitle="Join professional creators today" className="w-full max-w-md">
          <div className="space-y-6">
             <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={(e) => setForm({...form, full_name: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@provider.com"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                />
             </div>
            <Button className="w-full" onClick={handleRegister} isLoading={loading}>
              Create Account
            </Button>
            <p className="text-center text-gray-500 text-sm font-medium">
              Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}

// --- Error Pages & Settings ---

export const Settings = () => {
  const { user, logout, showToast } = useAuth()
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usageService.getUsage().then(setUsage).finally(() => setLoading(false))
  }, [])

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-12">Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <Card title="Account Profile" subtitle="Personal information and access">
              <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Identity</label>
                      <p className="text-white font-bold text-lg mt-1 truncate">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Display Name</label>
                      <p className="text-white font-bold text-lg mt-1">{user?.full_name}</p>
                    </div>
                  </div>
                  <hr className="border-dark-lightest" />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 font-medium">Exit Workspace</p>
                    <Button variant="danger" size="sm" onClick={logout}>Sign Out</Button>
                  </div>
              </div>
            </Card>

            <Card title="Platform Usage" subtitle="Today's activity and limits">
               {loading ? <Skeleton className="h-40 w-full" /> : (
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-dark p-4 rounded-xl border border-dark-lightest">
                          <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Standard Credits</span>
                          <span className="text-xl font-black text-white">{Math.min(usage?.count_today, 10)} / 10</span>
                       </div>
                       <div className="bg-dark p-4 rounded-xl border border-dark-lightest">
                          <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Reward Credits</span>
                          <span className="text-xl font-black text-primary">{usage?.reward_credits} used</span>
                       </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-bold text-white">Daily Total</p>
                          <p className="text-xs text-gray-500 font-medium">Max potential: 25 tasks/day</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xl font-black text-primary">{usage?.count_today} / {usage?.total_limit}</p>
                       </div>
                    </div>
                 </div>
               )}
            </Card>
          </div>

          <Card title="Billing & Subscription" subtitle="Manage your plan and payment methods">
             <div className="space-y-8">
                <div>
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-3">
                         <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <CreditCard size={24} />
                         </div>
                         <div>
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Plan</p>
                            <p className="text-xl font-black text-white capitalize">{user?.subscription_plan}</p>
                         </div>
                      </div>
                      <Badge variant={user?.is_pro ? 'success' : 'neutral'} className="text-xs py-1 px-3">
                         {user?.subscription_status === 'past_due' ? 'ACTION REQUIRED' : 'STATUS: ACTIVE'}
                      </Badge>
                   </div>

                   {user?.subscription_plan === 'free' ? (
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                         <p className="text-sm font-bold text-gray-300 mb-4">Unlock unlimited potential with Pro or Lifetime access.</p>
                         <Button className="w-full" onClick={() => window.location.href='/pricing'}>View Upgrade Options</Button>
                      </div>
                   ) : (
                      <div className="space-y-6">
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Renewal Date</span>
                            <span className="text-white font-bold">{user?.subscription_end ? new Date(user.subscription_end).toLocaleDateString() : 'N/A'}</span>
                         </div>
                         <div className="bg-dark p-4 rounded-xl border border-dark-lightest">
                            <p className="text-xs text-gray-500 leading-relaxed">
                               Your {user?.subscription_plan} plan is active. To manage your billing or cancel, please contact support@enhanceai.com.
                            </p>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      authService.verifyEmail(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'))
    }
  }, [token])

  return (
    <div className="container mx-auto px-4 py-32 flex justify-center">
      <Card className="w-full max-w-md text-center py-12">
        {status === 'loading' && (
          <div className="py-10"><Loader /></div>
        )}
        {status === 'success' && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Identity Verified</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">Your email has been confirmed. You now have full access to our engines.</p>
            <Button className="w-full" onClick={() => window.location.href='/login'}>Continue to Login</Button>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <X size={48} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Validation Failed</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">This link is invalid or has expired. Please request a new one from the login page.</p>
            <Button variant="secondary" className="w-full" onClick={() => window.location.href='/login'}>Return Home</Button>
          </motion.div>
        )}
      </Card>
    </div>
  )
}

export const NotFound = () => (
  <PageTransition>
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="text-[12rem] font-black text-primary/10 mb-[-4rem] select-none tracking-tighter">404</h1>
      <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Path Lost.</h2>
      <p className="text-gray-500 font-medium mb-12">We couldn't find the page you were looking for.</p>
      <Button size="lg" onClick={() => window.location.href = '/'}>Back to Safety</Button>
    </div>
  </PageTransition>
)

export const Unauthorized = () => (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="text-9xl font-black text-red-500/10 mb-[-2rem] select-none tracking-tighter">401</h1>
      <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Authentication Required.</h2>
      <p className="text-gray-500 font-medium mb-12">You need to sign in to access this workspace.</p>
      <Button size="lg" onClick={() => window.location.href = '/login'}>Identify Now</Button>
    </div>
)

export const Forbidden = () => (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="text-9xl font-black text-orange-500/10 mb-[-2rem] select-none tracking-tighter">403</h1>
      <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Access Prohibited.</h2>
      <p className="text-gray-500 font-medium mb-12">You don't have the permissions required for this resource.</p>
      <Button variant="secondary" size="lg" onClick={() => window.location.href = '/'}>Go Home</Button>
    </div>
)

export const InternalError = () => (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="text-9xl font-black text-gray-500/10 mb-[-2rem] select-none tracking-tighter">500</h1>
      <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Engine Failure.</h2>
      <p className="text-gray-500 font-medium mb-12">Something went wrong on our end. We're looking into it.</p>
      <Button variant="outline" size="lg" onClick={() => window.location.href = '/'}>Try Again Later</Button>
    </div>
)
