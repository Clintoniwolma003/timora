import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Billing() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "professional" | "enterprise" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch available plans
  const { data: plansData } = trpc.payment.getPlans.useQuery();
  const plans = plansData?.plans || [];

  // Fetch current subscription
  const { data: subscriptionData, isLoading: isLoadingSubscription } = trpc.payment.getSubscription.useQuery(
    undefined,
    { enabled: user?.role === "company_admin" || user?.role === "super_admin" }
  );

  // Initiate payment mutation
  const initiatePaymentMutation = trpc.payment.initiatePayment.useMutation({
    onSuccess: (data) => {
      if (data.data?.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.data.authorizationUrl;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initiate payment");
      setIsProcessing(false);
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = trpc.payment.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription cancelled successfully");
      // Refresh subscription data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  const handleSubscribe = async (planId: string) => {
    if (!user?.email) {
      toast.error("Email not found in user profile");
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      toast.error("Plan not found");
      return;
    }

    setSelectedPlan(planId as any);
    setIsProcessing(true);

    try {
      await initiatePaymentMutation.mutateAsync({
        plan: planId as any,
        email: user.email,
        amount: plan.amount,
      });
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      await cancelSubscriptionMutation.mutateAsync();
    } catch (error) {
      // Error is handled by mutation onError
    }
  };

  const subscription = subscriptionData?.subscription;
  const company = subscriptionData?.company;
  const isSubscriptionActive = company?.subscriptionStatus === "active";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-gray-500 mt-1">Manage your subscription and payment methods</p>
        </div>

        {/* Current Subscription Status */}
        {isLoadingSubscription ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading subscription information...
              </div>
            </CardContent>
          </Card>
        ) : isSubscriptionActive ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                Subscription Active
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="text-lg font-semibold capitalize">{subscription?.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold capitalize text-green-600">{subscription?.status}</p>
                </div>
                {subscription?.renewalDate && (
                  <div>
                    <p className="text-sm text-gray-600">Renewal Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(subscription.renewalDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleCancelSubscription}
                disabled={cancelSubscriptionMutation.isPending}
              >
                {cancelSubscriptionMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Subscription Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                Your subscription has expired or is inactive. Please select a plan below to activate your subscription and continue using TIMORA.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={plan.id === "professional" ? "border-blue-200 bg-blue-50" : ""}
              >
                <CardHeader>
                  <CardTitle className="capitalize">{plan.id}</CardTitle>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">${(plan.amount / 100).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">/month</p>
                  </div>
                  <Button
                    className="w-full"
                    variant={plan.id === "professional" ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isProcessing && selectedPlan === plan.id}
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
                <p className="font-medium">Paystack</p>
                <p className="text-sm text-gray-600">Secure payment processing for Africa and beyond</p>
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
