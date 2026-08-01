import React, { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

interface AdBannerProps {
  position: 'home' | 'dashboard' | 'history' | 'pricing'
  className?: string
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, className }) => {
  const { user } = useAuth()
  const adRef = useRef<HTMLModElement>(null)

  const isFree = user?.subscription_plan === 'free' || !user
  const client = import.meta.env.VITE_ADSENSE_CLIENT
  const slots = {
    home: import.meta.env.VITE_ADSENSE_SLOT_HOME,
    dashboard: import.meta.env.VITE_ADSENSE_SLOT_DASHBOARD,
    history: import.meta.env.VITE_ADSENSE_SLOT_HISTORY,
    pricing: import.meta.env.VITE_ADSENSE_SLOT_PRICING,
  }
  const slot = slots[position]

  useEffect(() => {
    if (isFree && client && slot && (window as any).adsbygoogle) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [isFree, client, slot])

  if (!isFree) return null

  // If no config, show placeholder for development
  if (!client || !slot) {
    return (
      <div className={`w-full bg-dark-lighter border border-dark-lightest rounded-2xl p-4 flex flex-col items-center justify-center min-h-[100px] text-gray-600 ${className}`}>
        <span className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Advertisement</span>
        <div className="w-full h-full border border-dashed border-gray-800 rounded-xl flex items-center justify-center italic text-sm">
          Development Placeholder: {position} banner
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full overflow-hidden flex flex-col items-center ${className}`}
    >
      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        ref={adRef}
      />
    </motion.div>
  )
}
