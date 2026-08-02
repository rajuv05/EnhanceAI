import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Button, Input, Badge } from '../components/UI'
import {
  ShieldCheck,
  Scale,
  RefreshCw,
  Mail,
  HelpCircle,
  Cookie,
  Copyright,
  AlertTriangle,
  Send,
  ChevronRight,
  Clock
} from "lucide-react" from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
      <div className="w-1.5 h-6 bg-primary rounded-full mr-3" />
      {title}
    </h2>
    <div className="text-gray-400 space-y-4 leading-relaxed font-medium">
      {children}
    </div>
  </div>
)

export const About = () => {
  React.useEffect(() => { document.title = "About Us | EnhanceAI" }, [])
  return (
    <PageTransition>
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">About <span className="text-primary">EnhanceAI</span></h1>
      <Card className="mb-12">
        <p className="text-xl text-gray-300 leading-relaxed font-medium">
          EnhanceAI is a production-grade media processing platform designed for professionals, developers, and creators who demand high-fidelity results without the complexity of traditional editing suites.
        </p>
      </Card>

      <Section title="Our Mission">
        <p>Our goal is to democratize high-performance media tools. By leveraging state-of-the-art FFmpeg engines and advanced image processing libraries like Pillow and OpenCV, we provide a suite of tools that are fast, reliable, and accessible from anywhere in the world.</p>
      </Section>

      <Section title="The Technology">
        <p>Unlike traditional editors that run locally and consume your system resources, EnhanceAI offloads the heavy lifting to our optimized cloud infrastructure. Whether you're compressing a 4K video or sharpening a high-resolution DSLR photo, our engine handles the processing in parallel to deliver results in seconds.</p>
      </Section>

      <Section title="Privacy First">
        <p>We take your data seriously. Your media is processed securely, stored using industry-standard encryption on Cloudinary, and is never shared with third parties. You retain full ownership of every asset you process on our platform.</p>
      </Section>
    </div>
  </PageTransition>
)
}

export const PrivacyPolicy = () => {
  React.useEffect(() => { document.title = "Privacy Policy | EnhanceAI" }, [])
  return (
    <PageTransition>
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="flex items-center space-x-3 mb-4">
        <ShieldCheck className="text-primary" size={32} />
        <Badge variant="primary">Effective: January 2026</Badge>
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter">Privacy Policy</h1>

      <Section title="1. Information We Collect">
        <p>Account Information: When you register, we collect your email address, full name, and encrypted password. This is required to provide secure access to your processed files and history.</p>
        <p>Uploaded Media: We temporarily store media files you upload for the purpose of processing. Final outputs are stored securely on Cloudinary.</p>
      </Section>

      <Section title="2. How We Use Data">
        <p>Your data is used exclusively to provide the media enhancement services you request, manage your subscription through Razorpay, and communicate important account updates.</p>
      </Section>

      <Section title="3. Third-Party Services">
        <p>We partner with trusted providers to deliver our service:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Cloudinary: Secure storage and delivery of media assets.</li>
          <li>Razorpay: Secure payment processing (we never store your credit card details).</li>
          <li>Google AdSense: Displays advertisements to users on our Free plan.</li>
        </ul>
      </Section>

      <Section title="4. Data Retention">
        <p>Free users' task history and processed files are typically retained for 30 days. Pro and Lifetime members enjoy unlimited history and storage retention as long as their account is active.</p>
      </Section>
    </div>
  </PageTransition>
)
}

export const TermsOfService = () => {
  React.useEffect(() => { document.title = "Terms of Service | EnhanceAI" }, [])
  return (
    <PageTransition>
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="flex items-center space-x-3 mb-4">
        <Scale className="text-primary" size={32} />
        <Badge variant="primary">Last Updated: Jan 2026</Badge>
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter">Terms of Service</h1>

      <Section title="1. Acceptance of Terms">
        <p>By accessing or using EnhanceAI, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, you are prohibited from using the service.</p>
      </Section>

      <Section title="2. User Responsibilities">
        <p>You are responsible for maintaining the security of your account and for all activities that occur under your credentials. You must notify us immediately of any unauthorized use of your account.</p>
      </Section>

      <Section title="3. Prohibited Content">
        <p>You may not use EnhanceAI to process media that is illegal, contains harmful code, violates intellectual property rights, or contains non-consensual explicit material. We reserve the right to terminate accounts that violate these standards.</p>
      </Section>

      <Section title="4. Subscription & Payments">
        <p>Subscriptions are billed in advance on a recurring basis. Lifetime access is a one-time payment. All payments are processed through Razorpay. You can manage or cancel your subscription at any time via your settings page.</p>
      </Section>
    </div>
  </PageTransition>
)
}

export const RefundPolicy = () => {
  React.useEffect(() => { document.title = "Refund Policy | EnhanceAI" }, [])
  return (
    <PageTransition>
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="flex items-center space-x-3 mb-4">
        <RefreshCw className="text-primary" size={32} />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter">Refund Policy</h1>

      <Section title="Subscription Cancellations">
        <p>You may cancel your Pro subscription at any time. Your access will remain active until the end of your current billing period, after which you will revert to the Free plan. No further charges will be made after cancellation.</p>
      </Section>

      <Section title="Refund Eligibility">
        <p>Because our service provides immediate access to high-cost computing resources (FFmpeg cloud processing), refunds are generally not provided for partially used billing periods. However, we may issue refunds in the following cases:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Duplicate charges due to technical errors.</li>
          <li>Verified platform downtime exceeding 24 hours.</li>
          <li>Unauthorized account activity reported within 48 hours of the transaction.</li>
        </ul>
      </Section>

      <Section title="How to Request">
        <p>To request a refund, please contact us at support@enhanceai.com with your transaction ID from Razorpay and a brief explanation of the issue.</p>
      </Section>
    </div>
  </PageTransition>
)
}

export const ContactUs = () => {
  React.useEffect(() => { document.title = "Contact Us | EnhanceAI" }, [])
  const { showToast } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast("Message sent successfully!", "success")
    }, 1000)
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Get in <span className="text-primary">touch.</span></h1>
            <p className="text-gray-400 text-lg font-medium mb-12 leading-relaxed">
              Have questions about our processing engine, pricing, or enterprise solutions? Our team is here to help.
            </p>

            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Email Support</p>
                  <p className="text-white font-bold text-lg">support@enhanceai.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Response Time</p>
                  <p className="text-white font-bold text-lg">Within 24 business hours</p>
                </div>
              </div>
            </div>
          </div>

          <Card title="Send a Message">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input placeholder="Your Name" required />
                <Input type="email" placeholder="Your Email" required />
              </div>
              <Input placeholder="Subject" required />
              <textarea
                className="w-full bg-dark border border-dark-lightest rounded-xl p-4 min-h-[150px] text-white outline-none focus:border-primary transition"
                placeholder="How can we help you?"
                required
              ></textarea>
              <Button className="w-full h-14" isLoading={loading}>
                Send Message <Send size={18} className="ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}

export const FAQ = () => {
  React.useEffect(() => { document.title = "FAQ | EnhanceAI" }, [])
  return (
    <PageTransition>
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="text-center mb-16">
        <HelpCircle className="text-primary mx-auto mb-6" size={48} />
        <h1 className="text-5xl font-black text-white tracking-tighter">Frequently Asked <span className="text-primary">Questions</span></h1>
      </div>

      <div className="space-y-6">
        {[
          { q: "What file formats are supported?", a: "We support major formats including MP4, MOV, AVI, WEBM for video, and JPG, PNG, WEBP, BMP, TIFF for images." },
          { q: "How long does processing take?", a: "Processing time depends on the file size and the tool used. Most images process in under 3 seconds. 720p videos typically process in less than 15 seconds." },
          { q: "Are my files secure?", a: "Yes. We use industry-standard encryption for data transfer and Cloudinary's secure infrastructure for storage. Your original and processed files are private to your account." },
          { q: "Do you store my files permanently?", a: "Free users' files are stored for 30 days. Pro and Lifetime users enjoy permanent storage of their processed history as long as their account remains active." },
          { q: "How do subscriptions work?", a: "Subscriptions are billed monthly via Razorpay. You can cancel anytime from your settings. Lifetime access is a one-time purchase with no recurring fees." }
        ].map((item, i) => (
          <Card key={i} title={item.q} className="hover:border-primary/30 cursor-default transition-colors">
            <p className="text-gray-400 font-medium leading-relaxed">{item.a}</p>
          </Card>
        ))}
      </div>
    </div>
  </PageTransition>
)
}

export const CookiePolicy = () => {
  React.useEffect(() => { document.title = "Cookie Policy | EnhanceAI" }, [])
  return (
    <PageTransition>
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="flex items-center space-x-3 mb-4">
        <Cookie className="text-primary" size={32} />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter">Cookie Policy</h1>

      <Section title="What are Cookies?">
        <p>Cookies are small text files stored on your device to help websites function correctly and provide a better user experience.</p>
      </Section>

      <Section title="Essential Cookies">
        <p>These are necessary for the website to function. We use them for authentication (keeping you logged in) and security purposes. Disabling these will prevent the service from working.</p>
      </Section>

      <Section title="Performance & Analytics">
        <p>We may use cookies to understand how users interact with our platform, which tools are most popular, and to identify technical issues. This data is anonymized.</p>
      </Section>

      <Section title="Advertising Cookies">
        <p>Google AdSense uses cookies to serve relevant advertisements to users on the Free plan. You can manage your ad preferences through your Google account settings.</p>
      </Section>
    </div>
  </PageTransition>
)
}

export const DMCA = () => {
  React.useEffect(() => { document.title = "DMCA Policy | EnhanceAI" }, [])
  return (
    <PageTransition>
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="flex items-center space-x-3 mb-4">
        <Copyright className="text-primary" size={32} />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter">DMCA Policy</h1>

      <Section title="Copyright Protection">
        <p>EnhanceAI respects the intellectual property rights of others. We expect our users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond quickly to claims of copyright infringement.</p>
      </Section>

      <Section title="Reporting Infringement">
        <p>If you believe your copyrighted work is being used on our platform without authorization, please send a formal notice to dmca@enhanceai.com containing:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>A description of the copyrighted work.</li>
          <li>The specific URL or location on our service.</li>
          <li>Your contact information (email and physical address).</li>
          <li>A statement that you have a good faith belief the use is unauthorized.</li>
        </ul>
      </Section>
    </div>
  </PageTransition>
)
}

export const AcceptableUse = () => {
  React.useEffect(() => { document.title = "Acceptable Use Policy | EnhanceAI" }, [])
  return (
    <PageTransition>
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="flex items-center space-x-3 mb-4">
        <AlertTriangle className="text-primary" size={32} />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter">Acceptable Use</h1>

      <Section title="System Integrity">
        <p>You may not attempt to bypass our usage limits, reverse engineer our processing engine, or use automated scripts (bots) to upload media without prior written authorization.</p>
      </Section>

      <Section title="Content Standards">
        <p>Media processed through EnhanceAI must not:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Promote illegal activities.</li>
          <li>Violate the privacy or publicity rights of others.</li>
          <li>Contain child sexual abuse material (CSAM) - we have zero tolerance and will report to authorities.</li>
          <li>Distribute malware or viruses.</li>
        </ul>
      </Section>

      <Section title="Resource Usage">
        <p>While Pro users have unlimited processing, we reserve the right to throttle accounts that demonstrate abnormal 'bot-like' behavior that threatens the stability of our cloud infrastructure for other users.</p>
      </Section>
    </div>
  </PageTransition>
)
}
