"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  CheckCircle2,
  Globe,
  Sparkles,
  Shield,
  Zap,
  Cpu,
  Code,
  Languages,
  BarChart3,
  Users,
  Star,
  ArrowRight as ArrowRightIcon
} from "lucide-react"

export default function LearnMorePage() {
  const technologies = [
    {
      icon: Cpu,
      title: "Machine Learning Models",
      description: "Powered by state-of-the-art NLP models including LanguageTool, MarianMT, and custom transformers for accurate text processing."
    },
    {
      icon: Code,
      title: "Modern Tech Stack",
      description: "Built with React, Next.js, Node.js, Express, MongoDB, and Python FastAPI for scalable, maintainable architecture."
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Process text in 8+ languages: English, Hindi, Spanish, French, German, Korean, Arabic, and Chinese."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with JWT authentication, role-based access control, and data encryption."
    }
  ]

  const features = [
    {
      icon: CheckCircle2,
      title: "Grammar Correction",
      description: "Advanced grammar checking with contextual suggestions and multi-language support.",
      benefits: ["Real-time corrections", "Style improvements", "Language-specific rules"]
    },
    {
      icon: Globe,
      title: "Text Translation",
      description: "Professional-grade translation preserving meaning, tone, and cultural context.",
      benefits: ["Multiple language pairs", "Context preservation", "High accuracy rates"]
    },
    {
      icon: Sparkles,
      title: "AI Humanization",
      description: "Transform AI-generated text into natural, human-like writing styles.",
      benefits: ["Tone customization", "Natural flow", "Word limit validation"]
    },
    {
      icon: Shield,
      title: "Plagiarism Detection",
      description: "Comprehensive plagiarism analysis with detailed similarity reports.",
      benefits: ["Detailed matches", "Similarity scores", "Multi-language support"]
    }
  ]

  const stats = [
    { value: "99.9%", label: "Accuracy Rate", icon: Star },
    { value: "< 2s", label: "Response Time", icon: Zap },
    { value: "8+", label: "Languages", icon: Languages },
    { value: "10K+", label: "Texts Processed", icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-sm">VQ</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                VerbalQ
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero / Summary */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose VerbalQ</h2>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Why This Platform</h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Built with cutting-edge technology and designed for professionals who demand accuracy, speed, and reliability.
          </p>
        </div>

        {/* Core Capabilities */}
        <section className="mb-10">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow">
              <h4 className="font-semibold mb-2">Built using modern full-stack technologies</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">React, Next.js, Node.js, Express, MongoDB, and Python FastAPI</p>
            </div>
            <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow">
              <h4 className="font-semibold mb-2">Powered by real machine learning models</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Advanced NLP models including LanguageTool, MarianMT, and custom transformers</p>
            </div>
            <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow">
              <h4 className="font-semibold mb-2">Supports multiple languages</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Process text in English, Hindi, Spanish, French, German, Korean, Arabic, and Chinese</p>
            </div>
            <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow">
              <h4 className="font-semibold mb-2">Secure authentication and role-based access</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">JWT-based authentication with admin and user roles for secure access control</p>
            </div>
            <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow">
              <h4 className="font-semibold mb-2">Designed for accuracy and performance</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Optimized algorithms deliver fast, accurate results with minimal latency</p>
            </div>
            <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow">
              <h4 className="font-semibold mb-2">Professional-grade AI processing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enterprise-level text analysis with detailed insights and recommendations</p>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built with enterprise-grade technologies for reliability, scalability, and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {technologies.map((tech, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <tech.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {tech.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {tech.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Detailed */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive AI Tools
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every tool is designed with precision and powered by advanced AI models.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <CardContent className="p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, index) => (
                  <div key={index} className="text-white">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-blue-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call To Action */}
        <section className="mb-20">
          <div className="text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 max-w-4xl mx-auto">
              <CardContent className="p-12 text-white">
                <h2 className="text-3xl font-bold mb-6">
                  Start analyzing and improving your text today.
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
                  Join thousands of professionals who trust VerbalQ for their text processing needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="#features" className="inline-flex">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center">
                      Explore Features
                    </Button>
                  </Link>
                  <Link href="/login" className="inline-flex">
                    <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all duration-200 inline-flex items-center">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}