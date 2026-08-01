import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, CheckCircle, ArrowRight } from 'lucide-react'
import { Button, Card, Badge } from './UI'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: (plan: string) => void
  loading: string | null
  reason?: string
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, loading, reason }) => {
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

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Content Side */}
              <div className="p-10 bg-primary/5">
                <Badge variant="primary" className="mb-4">Upgrade Required</Badge>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                  {reason || "Unlock Unlimited Potential"}
                </h2>
                <p className="text-gray-400 font-medium mb-8">
                  The Free plan has strict limits. Upgrade to Pro or Lifetime for the full professional experience.
                </p>

                <div className="space-y-4">
                  {[
                    "Unlimited daily processing",
                    "2GB maximum file size support",
                    "No watermarks on processed media",
                    "Priority server access (2x faster)",
                    "Early access to future AI tools",
                    "Unlimited history and storage"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center text-sm font-bold text-gray-300">
                      <CheckCircle className="text-primary mr-3 shrink-0" size={18} /> {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Plans Side */}
              <div className="p-10 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                    <Card className="relative bg-dark-lightest/30 border-primary/20">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-black text-xl text-white">Pro Monthly</h4>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Best for ongoing projects</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-white">₹29</div>
                          <div className="text-[10px] text-gray-500 font-bold">/ MONTH</div>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        isLoading={loading === 'pro'}
                        onClick={() => onUpgrade('pro')}
                      >
                        Subscribe Now <ArrowRight size={16} className="ml-2"/>
                      </Button>
                    </Card>
                  </div>

                  <Card className="bg-dark-lightest/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-xl text-white">Lifetime Access</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Pay once, own forever</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-white">₹499</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase">ONE TIME</div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full border-primary/30 text-primary"
                      isLoading={loading === 'lifetime'}
                      onClick={() => onUpgrade('lifetime')}
                    >
                      Buy Lifetime Access
                    </Button>
                  </Card>
                </div>

                <p className="text-center text-[10px] text-gray-500 font-medium">
                  Secure payment via Stripe. Cancel subscription anytime from your settings.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
