"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Globe, CheckCircle2 } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="flex flex-col gap-8">
            {/* Logo and Badge */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">VQ</span>
              </div>
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                ✨ AI-Powered Platform
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                  Transform Text
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  with VerbalQ
                </span>
              </h1>
              <p className="text-sm font-bold text-blue-600/80 uppercase tracking-widest mb-1">
                Powered by vionys
              </p>
              <h2 className="text-xl font-medium text-slate-500 dark:text-slate-400 max-w-lg italic">
                "Bridging obstacles in technology"
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg mt-4">
                Our platform aims to bridge obstacles in technology with AI-powered tools for writing, translation, and detection.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grammar Check</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Translation</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Humanization</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <Link href="/login" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-4 rounded-xl transition-all duration-200"
              >
                <Link href="/learn-more">
                  Learn More
                </Link>
            </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>8+ Languages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Demo */}
          <div className="relative">
            {/* Floating Cards */}
            <div className="relative w-full max-w-md mx-auto">
              {/* Main Card */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">VQ</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Grammar Check</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Processing...</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      "The quick brown fox jump over the lazy dog."
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          "The quick brown fox <span className="font-semibold underline">jumps</span> over the lazy dog."
                        </p>
                        <p className="text-xs text-green-600 mt-1">Subject-verb agreement corrected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-bounce">
                AI Fixed!
              </div>

              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">
                Real-time
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
