import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Zap, BarChart3, Shield, Users } from "lucide-react";
import { getLoginUrl } from "@/const";

/**
 * TIMORA - Premium SaaS Landing Page
 * 
 * Modern, responsive landing page with premium spacing and layout
 * Responsive on mobile, tablet, and desktop (Stripe/Linear/Vercel level)
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="text-xl font-bold text-white">TIMORA</div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard'}>
                  Dashboard
                </Button>
                <Button size="sm" onClick={logout}>Logout</Button>
              </>
            ) : (
              <Button size="sm" onClick={() => window.location.href = getLoginUrl()}>
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6">
              <Zap className="size-3" />
              Now with GPS Tracking
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white max-w-3xl mb-4">
              Workforce Management <span className="text-blue-400">Made Simple</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed mb-8">
              Real-time attendance tracking, GPS monitoring, and advanced analytics for modern teams.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Get Started
                <ArrowRight className="size-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Trust badges */}
            <p className="text-sm text-gray-400 mt-8">
              Trusted by 500+ companies worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-300 max-w-2xl leading-relaxed">
              Everything you need to manage your workforce efficiently
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border/40 rounded-xl p-6 sm:p-8 hover:border-border/80 transition-colors group">
              <div className="inline-flex items-center justify-center size-12 rounded-lg bg-blue-500/10 text-blue-400 mb-4 group-hover:bg-blue-500/20 transition-colors">
                <BarChart3 className="size-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Get instant insights into attendance patterns and team performance
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border/40 rounded-xl p-6 sm:p-8 hover:border-border/80 transition-colors group">
              <div className="inline-flex items-center justify-center size-12 rounded-lg bg-blue-500/10 text-blue-400 mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Shield className="size-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">GPS Tracking</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Monitor team location with precise GPS coordinates and geofencing
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border/40 rounded-xl p-6 sm:p-8 hover:border-border/80 transition-colors group">
              <div className="inline-flex items-center justify-center size-12 rounded-lg bg-blue-500/10 text-blue-400 mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Users className="size-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Team Management</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Manage roles, permissions, and team structures with ease
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-300 max-w-2xl leading-relaxed">
              Choose the perfect plan for your team
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Starter Plan */}
            <div className="bg-card border border-border/40 rounded-xl p-6 sm:p-8 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
              <p className="text-gray-400 text-sm mb-6">Perfect for small teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-gray-400 text-sm ml-2">/month</span>
              </div>
              <Button variant="outline" className="w-full mb-6">
                Get Started
              </Button>
              <ul className="space-y-3 flex-1">
                {['Up to 10 users', 'Basic analytics', 'Email support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="size-4 text-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Professional Plan */}
            <div className="bg-card border border-blue-500/40 rounded-xl p-6 sm:p-8 flex flex-col ring-1 ring-blue-500/20 relative">
              <div className="absolute -top-3 left-4 bg-background px-2 py-1 rounded-full text-xs font-medium text-blue-400 border border-blue-500/40">
                Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Professional</h3>
              <p className="text-gray-400 text-sm mb-6">Best for growing teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$299</span>
                <span className="text-gray-400 text-sm ml-2">/month</span>
              </div>
              <Button className="w-full mb-6">
                Get Started
              </Button>
              <ul className="space-y-3 flex-1">
                {['Up to 50 users', 'Advanced analytics', 'GPS tracking', 'Priority support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="size-4 text-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-card border border-border/40 rounded-xl p-6 sm:p-8 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 text-sm mb-6">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <Button variant="outline" className="w-full mb-6">
                Contact Sales
              </Button>
              <ul className="space-y-3 flex-1">
                {['Unlimited users', 'Custom features', 'Dedicated support', 'SLA guarantee'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="size-4 text-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Workforce?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join hundreds of companies using TIMORA to streamline their operations
            </p>
            <Button
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Start Free Trial
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border/40 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Column 1 */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Security</a></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-white font-semibold mb-4">Follow</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
            <p>&copy; 2024 TIMORA. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-gray-200 transition-colors">Status</a>
              <a href="#" className="hover:text-gray-200 transition-colors">API</a>
              <a href="#" className="hover:text-gray-200 transition-colors">Docs</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
