import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, CheckCircle, ArrowRight, PlayCircle } from 'lucide-react'
import { Button, Card, Badge } from './UI'
import { usageService } from '../services/api'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: (plan: string) => void
  onRewardSuccess?: () => void
  loading: string | null
  reason?: string
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, onRewardSuccess, loading, reason }) => {
  const [adLoading, setAdLoading] = useState(false)

  const handleWatchAd = async () => {
    setAdLoading(true)
    try {
      // Simulate watching an ad (e.g. show a popup or video for 3s)
      await new Promise(res => setTimeout(res, 3000))
      await usageService.claimReward()
      if (onRewardSuccess) onRewardSuccess()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setAdLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-dark-lighter border border-dark-lightest rounded-3xl shadow-2xl overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition z-10">
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Content Side */}
              <div className="lg:col-span-5 p-10 bg-primary/5">
                <Badge variant="primary" className="mb-4">Limit Reached</Badge>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                  {reason || "Unlock Unlimited Potential"}
                </h2>
                <p className="text-gray-400 font-medium mb-8">
                  The Free plan has strict limits. Upgrade to Pro or watch an ad to get temporary bonus credits.
                </p>

                <div className="space-y-4">
                  {[
                    "Unlimited daily processing",
                    "2GB maximum file size support",
                    "No watermarks on media",
                    "Priority server access",
                    "Unlimited history"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center text-sm font-bold text-gray-300">
                      <CheckCircle className="text-primary mr-3 shrink-0" size={18} /> {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Options Side */}
              <div className="lg:col-span-7 p-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                    <Card className="relative bg-dark-lightest/30 border-primary/20">
                      <div className="mb-6">
                        <h4 className="font-black text-xl text-white">Pro Monthly</h4>
                        <div className="flex items-baseline mt-2">
                           <span className="text-2xl font-black text-white">₹29</span>
                           <span className="text-[10px] text-gray-500 font-bold ml-1">/ MONTH</span>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        isLoading={loading === 'pro'}
                        onClick={() => onUpgrade('pro')}
                      >
                        Go Pro <ArrowRight size={16} className="ml-2"/>
                      </Button>
                    </Card>
                  </div>

                  <Card className="bg-dark-lightest/10 border-dashed border-gray-700">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <PlayCircle size={18} className="mr-2 text-primary" /> Rewarded Access
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mb-4">
                      Watch a short advertisement to get +5 processing credits valid for today.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      isLoading={adLoading}
                      onClick={handleWatchAd}
                    >
                      Watch Ad (+5)
                    </Button>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-dark-lightest/10">
                    <div className="mb-4">
                      <h4 className="font-black text-lg text-white">Lifetime</h4>
                      <div className="text-xl font-black text-white mt-1">₹499</div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      isLoading={loading === 'lifetime'}
                      onClick={() => onUpgrade('lifetime')}
                    >
                      Buy Once
                    </Button>
                  </Card>

                  <p className="text-[10px] text-gray-600 font-medium leading-relaxed">
                    By watching an ad, you agree to our ad policy. Rewards are limited to 3 per day. Pro subscriptions are managed via Razorpay.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
