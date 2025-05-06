"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Box, CheckCircle, Loader2, Package, ShieldCheck, TrendingUp } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      setIsRedirecting(true)
      router.push("/dashboard")
    }
  }, [loading, router, user])

  if (loading || isRedirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Inventory Manager</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 items-center justify-center bg-background text-center py-20 md:py-32">
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Manage Your Inventory <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            A comprehensive inventory management system for small shops. Track stock, manage suppliers, and monitor
            transactions all in one place.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
          <p className="mt-4 text-muted-foreground">
            Our inventory management system provides all the tools you need to run your business efficiently.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Package className="mb-4 h-12 w-12 text-primary" />}
            title="Inventory Tracking"
            description="Keep track of all your products, their quantities, and get alerts when stock is running low."
          />
          <FeatureCard
            icon={<TrendingUp className="mb-4 h-12 w-12 text-primary" />}
            title="Sales & Purchases"
            description="Record all transactions and get insights into your business performance with detailed reports."
          />
          <FeatureCard
            icon={<ShieldCheck className="mb-4 h-12 w-12 text-primary" />}
            title="Secure & Reliable"
            description="Your data is securely stored and accessible only to authorized personnel with role-based access."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted py-20">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What Our Users Say</h2>
            <p className="mt-4 text-muted-foreground">
              Businesses of all sizes trust our inventory management system to run their operations.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote:
                  "This system has transformed how we manage our inventory. We've reduced stockouts by 85% and improved our overall efficiency.",
                name: "Sarah Johnson, Retail Store Owner",
              },
              {
                quote:
                  "Easy to use and incredibly powerful. The dashboard gives me a quick overview of my business at a glance.",
                name: "Michael Chen, E-commerce Business",
              },
              {
                quote:
                  "The supplier management feature has helped us build better relationships with our vendors and negotiate better terms.",
                name: "Lisa Rodriguez, Wholesale Distributor",
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="mb-4 italic text-muted-foreground">"{testimonial.quote}"</p>
                <p className="font-semibold">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20">
        <div className="rounded-lg bg-primary p-8 text-center text-primary-foreground md:p-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Ready to Get Started?</h2>
          <p className="mb-8 text-lg">
            Join thousands of businesses that use our inventory management system to streamline their operations.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Sign Up Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted">
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Box className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Inventory Manager</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Inventory Manager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm">
      {icon}
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
