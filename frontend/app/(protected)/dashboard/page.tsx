"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Zap, Globe, Shield, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
          <span className="text-white font-bold text-2xl">VQ</span>
        </div>
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-3">
            Welcome to VerbalQ
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform your text with our AI-powered tools. Grammar correction, translation, humanization, and more.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Grammar & Writing Correction */}
        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-0">
                Grammar
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Grammar & Writing
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Enhance your writing quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Detect and correct grammar issues with intelligent suggestions across multiple languages.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg">
              <Link href="/dashboard/grammar" className="flex items-center justify-center gap-2">
                Try Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Language Translation */}
        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-0">
                Translation
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Translate Text
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Multi-language support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Translate text accurately between multiple languages with high precision.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg">
              <Link href="/dashboard/translation" className="flex items-center justify-center gap-2">
                Try Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* AI Text Humanization */}
        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-0">
                Humanize
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Humanize AI Text
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Natural language conversion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Convert AI-generated text into natural, human-like writing with proper word limits.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg">
              <Link href="/dashboard/humanize" className="flex items-center justify-center gap-2">
                Try Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Plagiarism Detection */}
        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-0">
                Plagiarism
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Plagiarism Check
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Text similarity analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Analyze text similarity and identify potential plagiarism across multiple languages.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg">
              <Link href="/dashboard/plagiarism" className="flex items-center justify-center gap-2">
                Try Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950 dark:via-gray-900 dark:to-purple-950">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-xl">📊</span>
              </div>
              Quick Stats
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Your activity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Texts Processed</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">0</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language Pairs</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-yellow-950 dark:via-gray-900 dark:to-orange-950">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
              Getting Started with VerbalQ
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Quick setup guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Choose a Tool</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Select from grammar, translation, humanization, or plagiarism check</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Input Your Text</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paste or type your content and select the appropriate language</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Get AI Results</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View intelligent AI-powered text processing results</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
