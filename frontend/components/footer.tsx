"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                VQ
              </div>
              <span className="text-xl font-bold text-white tracking-tight">VerbalQ</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs text-slate-400">
              Powered by <span className="text-blue-400 font-semibold">vionys</span>. Aiming to bridge obstacles in technology through advanced AI integration.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors p-2 bg-slate-900 rounded-lg"><Github className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors p-2 bg-slate-900 rounded-lg"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors p-2 bg-slate-900 rounded-lg"><Mail className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Our Tools</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/dashboard/grammar" className="hover:text-blue-400 transition-colors">Grammar Checker</Link></li>
              <li><Link href="/dashboard/translation" className="hover:text-blue-400 transition-colors">AI Translation</Link></li>
              <li><Link href="/dashboard/humanize" className="hover:text-blue-400 transition-colors">Text Humanizer</Link></li>
              <li><Link href="/dashboard/plagiarism" className="hover:text-blue-400 transition-colors">Plagiarism Check</Link></li>
            </ul>
          </div>

          {/* Links Section */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/learn-more" className="hover:text-blue-400 transition-colors">How it works</Link></li>
              <li><Link href="/login" className="hover:text-blue-400 transition-colors">User Dashboard</Link></li>
              <li><Link href="/register" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
              <li><Link href="/admin/login" className="hover:text-blue-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal & Privacy</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium">
          <p>© {currentYear} VerbalQ Inc. Built with passion for better communication.</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Status: Operational
            </span>
            <span className="text-slate-600">Ver 2.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
