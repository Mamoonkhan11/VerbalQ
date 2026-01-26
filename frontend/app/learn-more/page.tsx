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
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-6">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              About VerbalQ
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              The Future of
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Text Intelligence
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            VerbalQ is a comprehensive AI-powered platform that transforms how you process, analyze, and enhance text.
            Built with cutting-edge machine learning and natural language processing technologies.
          </p>
        </div>

        {/* Why This Platform */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why This Platform
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built with cutting-edge technology and designed for professionals who demand accuracy, speed, and reliability.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Built using modern full-stack technologies</h3>
              <p className="text-gray-600 dark:text-gray-400">React, Next.js, Node.js, Express, MongoDB, and Python FastAPI</p>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Powered by real machine learning models</h3>
              <p className="text-gray-600 dark:text-gray-400">Advanced NLP models including LanguageTool, MarianMT, and custom transformers</p>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Supports multiple languages</h3>
              <p className="text-gray-600 dark:text-gray-400">Process text in English, Hindi, Spanish, French, German, Korean, Arabic, and Chinese</p>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure authentication and role-based access</h3>
              <p className="text-gray-600 dark:text-gray-400">JWT-based authentication with admin and user roles for secure access control</p>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Designed for accuracy and performance</h3>
              <p className="text-gray-600 dark:text-gray-400">Optimized algorithms deliver fast, accurate results with minimal latency</p>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional-grade AI processing</h3>
              <p className="text-gray-600 dark:text-gray-400">Enterprise-level text analysis with detailed insights and recommendations</p>
            </Card>
          </div>

          {/* Stats Block */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">8+</div>
              <div className="text-gray-600 dark:text-gray-400">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">4</div>
              <div className="text-gray-600 dark:text-gray-400">AI Tools</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">&lt;2s</div>
              <div className="text-gray-600 dark:text-gray-400">Response Time</div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-lg text-gray-700 dark:text-gray-300">Start analyzing and improving your text today.</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join thousands of professionals who trust VerbalQ for their text processing needs.</p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <a href="#features" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg">Explore Features</a>
              <a href="/login" className="inline-flex items-center gap-3 border-2 border-gray-300 text-gray-700 bg-white/80 font-semibold px-6 py-3 rounded-xl">Get Started Free</a>
            </div>
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

        {/* Mission Section */}
        <section className="mb-20">
          <div className="text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 max-w-4xl mx-auto">
              <CardContent className="p-12 text-white">
                <Users className="w-16 h-16 mx-auto mb-6 text-blue-400" />
                <h2 className="text-3xl font-bold mb-6">
                  Empowering Text Processing Worldwide
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
                  Our mission is to democratize access to advanced AI text processing tools,
                  making professional-grade language intelligence available to everyone,
                  from students to enterprise organizations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/login">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                      Start Using VerbalQ
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl transition-all duration-200">
                      Back to Home
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