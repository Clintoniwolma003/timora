import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard } from "lucide-react";

export default function Billing() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-gray-500 mt-1">Manage your subscription and payment methods</p>
        </div>

        {/* Alert */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Subscription Inactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Your subscription has expired or is inactive. Please renew your subscription to continue using TIMORA.
            </p>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <p className="text-sm text-gray-600">For small teams</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">$29</p>
                <p className="text-sm text-gray-600">/month</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✓ Up to 50 staff</li>
                <li>✓ 1 location</li>
                <li>✓ Basic attendance tracking</li>
                <li>✓ Email support</li>
              </ul>
              <Button className="w-full">Subscribe Now</Button>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <p className="text-sm text-gray-600">Most popular</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">$79</p>
                <p className="text-sm text-gray-600">/month</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✓ Up to 500 staff</li>
                <li>✓ Unlimited locations</li>
                <li>✓ Advanced analytics</li>
                <li>✓ GPS tracking</li>
                <li>✓ Priority support</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Subscribe Now</Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <p className="text-sm text-gray-600">For large organizations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">Custom</p>
                <p className="text-sm text-gray-600">Contact us</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✓ Unlimited staff</li>
                <li>✓ Unlimited locations</li>
                <li>✓ Custom integrations</li>
                <li>✓ Dedicated support</li>
                <li>✓ SLA guarantee</li>
              </ul>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="font-medium">Stripe</p>
                <p className="text-sm text-gray-600">Secure payment processing worldwide</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-medium">Paystack</p>
                <p className="text-sm text-gray-600">Payment processing for Africa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Contact our support team for billing inquiries or subscription management.
            </p>
            <Button variant="outline">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
