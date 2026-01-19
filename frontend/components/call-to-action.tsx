"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CallToAction() {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl sm:text-4xl font-bold text-foreground mb-6">
          Start analyzing and improving your text today.
        </h2>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:opacity-90">
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
    </section>
  )
}
