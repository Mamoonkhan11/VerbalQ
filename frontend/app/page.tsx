"use client"

import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import PowerfulFeatures from "@/components/powerful-features"
import HowItWorks from "@/components/how-it-works"
import FeedbackForm from "@/components/feedback-form"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <Navbar />
      <Hero />
      <PowerfulFeatures />
      <HowItWorks />
      <FeedbackForm />
      <Footer />
    </main>
  )
}
