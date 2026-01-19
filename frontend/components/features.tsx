"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    id: 1,
    title: "Grammar & Writing Correction",
    description: "Detect and correct grammar issues across multiple languages with intelligent suggestions.",
    icon: "✓",
  },
  {
    id: 2,
    title: "Language Translation",
    description: "Translate text accurately between multiple languages while preserving meaning and tone.",
    icon: "→",
  },
  {
    id: 3,
    title: "AI Text Humanization",
    description: "Convert AI-generated text into natural, human-like writing styles.",
    icon: "◆",
  },
  {
    id: 4,
    title: "Plagiarism Detection",
    description: "Analyze text similarity and identify potential plagiarism with detailed insights.",
    icon: "🔍",
  },
]

export default function Features() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-balance text-3xl sm:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-balance text-lg text-muted-foreground">
            Everything you need for advanced text processing and analysis
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.id} className="border border-border bg-background">
              <CardHeader>
                <div className="text-2xl mb-4 text-primary">{feature.icon}</div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
