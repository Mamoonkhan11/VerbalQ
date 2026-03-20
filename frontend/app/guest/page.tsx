"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useGuestUsage } from "@/hooks/use-guest-usage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowRight, Sparkles, Globe, FileText, Lock, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import { SignupLimitModal } from "@/components/SignupLimitModal"

export default function GuestDashboardPage() {
  const router = useRouter()
  const { user, limitReached, incrementUsage } = useAuth()
  const { usageCount, remainingUses } = useGuestUsage()
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])
  
  // Mark component as mounted on client
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Show loading during SSR/hydration
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }
  
  const services = [
    {
      name: "Grammar Checker",
      description: "Check and improve your writing with AI-powered grammar correction",
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-600",
      href: "/guest/grammar",
      disabled: false,
    },
    {
      name: "Translation",
      description: "Translate text between 8+ languages instantly",
      icon: Globe,
      color: "from-blue-500 to-cyan-600",
      href: "/guest/translate",
      disabled: false,
    },
    {
      name: "Humanize Text",
      description: "Make AI-generated text sound more natural and human-like",
      icon: Sparkles,
      color: "from-purple-500 to-pink-600",
      href: "/guest/humanize",
      disabled: false,
    },
    {
      name: "Plagiarism Detection",
      description: "Check for originality and detect AI-generated content",
      icon: FileText,
      color: "from-orange-500 to-red-600",
      href: "/login?redirect=/dashboard/plagiarism",
      disabled: true,
      requiresAuth: true,
    },
  ]
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700">
              ✨ Free Access - No Signup Required
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Try VerbalQ Free -{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                3 Uses Limited
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Use our AI-powered tools right now, no account needed. After 3 free uses, create a free account for unlimited access!
            </p>
            
            {/* Usage Counter */}
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((use) => (
                  <div
                    key={use}
                    className={`w-3 h-3 rounded-full transition-all ${
                      use <= usageCount
                        ? "bg-green-500 scale-110"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {remainingUses} free {remainingUses === 1 ? 'use' : 'uses'} left
              </span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Grid */}
      <section className="flex-1 py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon
              
              if (service.disabled) {
                return (
                  <Card
                    key={service.name}
                    className="relative border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-75 cursor-not-allowed"
                  >
                    <div className="absolute top-4 right-4">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button disabled className="w-full bg-gray-300 dark:bg-gray-700">
                        <Lock className="w-4 h-4 mr-2" />
                        Sign Up Required
                      </Button>
                    </CardContent>
                  </Card>
                )
              }
              
              return (
                <Card
                  key={service.name}
                  className="relative hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-800 group"
                >
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={service.href} className="block">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group">
                        Use Now
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border-blue-200 dark:border-gray-700">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  Want Unlimited Access?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Create a free account to unlock all features, save your history, and use our tools without limits!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={`/register?from=limit`}>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href={`/login?redirect=/guest`}>
                    <Button size="lg" variant="outline" className="border-2">
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In Instead
                    </Button>
                  </Link>
                </div>
                
                {/* Benefits */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Unlimited Usage</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">No more 3-use limits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Save History</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Access past checks anytime</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">All Features</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Including plagiarism detection</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
      
      {/* Limit Modal */}
      <SignupLimitModal 
        open={showLimitModal || (limitReached && !user)} 
        onOpenChange={setShowLimitModal}
        usageCount={usageCount}
      />
    </div>
  )
}
