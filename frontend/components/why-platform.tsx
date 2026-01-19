"use client"

import { Code, Cpu, Languages, Shield, Zap, CheckCircle } from "lucide-react"

export default function WhyPlatform() {
  const features = [
    {
      icon: Code,
      title: "Built using modern full-stack technologies",
      description: "React, Next.js, Node.js, Express, MongoDB, and Python FastAPI"
    },
    {
      icon: Cpu,
      title: "Powered by real machine learning models",
      description: "Advanced NLP models including LanguageTool, MarianMT, and custom transformers"
    },
    {
      icon: Languages,
      title: "Supports multiple languages",
      description: "Process text in English, Hindi, Spanish, French, German, Korean, Arabic, and Chinese"
    },
    {
      icon: Shield,
      title: "Secure authentication and role-based access",
      description: "JWT-based authentication with admin and user roles for secure access control"
    },
    {
      icon: Zap,
      title: "Designed for accuracy and performance",
      description: "Optimized algorithms deliver fast, accurate results with minimal latency"
    },
    {
      icon: CheckCircle,
      title: "Professional-grade AI processing",
      description: "Enterprise-level text analysis with detailed insights and recommendations"
    }
  ]

  return (
    <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Why Choose VerbalQ
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Why This Platform
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Built with cutting-edge technology and designed for professionals who demand accuracy, speed, and reliability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                8+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Languages</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                4
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">AI Tools</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                99.9%
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Accuracy</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                &lt;2s
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Response Time</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 max-w-4xl mx-auto text-white">
            <h3 className="text-3xl font-bold mb-4">
              Start analyzing and improving your text today.
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              Join thousands of professionals who trust VerbalQ for their text processing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#features"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center justify-center"
              >
                Explore Features
              </a>
              <a
                href="/login"
                className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all duration-200 inline-flex items-center justify-center"
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}