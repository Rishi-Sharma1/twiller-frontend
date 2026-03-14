"use client";

import { Check, X } from "lucide-react";
import axios from "../../lib/axiosInstance";
import { useAuth } from "../..//context/AuthContext";
import TwitterLogo from "../../components/Twitterlogo";
import { Button } from "../../components/ui/button";

const plans = [
  { 
    name: "Free", 
    price: 0, 
    limit: "1 Post", 
    monthly: "Free",
    features: [
      { name: "Post up to 1 tweet", included: true },
      { name: "View feed", included: true },
      { name: "Like & Retweet", included: true },
      { name: "Edit posts", included: false },
      { name: "Longer posts", included: false },
      { name: "Blue checkmark", included: false },
    ],
    apiName: "FREE"
  },
  { 
    name: "Bronze", 
    price: 100, 
    limit: "3 Posts", 
    monthly: "₹100 / month",
    features: [
      { name: "Post up to 3 tweets", included: true },
      { name: "View feed", included: true },
      { name: "Like & Retweet", included: true },
      { name: "Edit posts", included: true },
      { name: "Longer posts", included: false },
      { name: "Blue checkmark", included: true },
    ],
    apiName: "BRONZE"
  },
  { 
    name: "Silver", 
    price: 300, 
    limit: "5 Posts", 
    monthly: "₹300 / month",
    features: [
      { name: "Post up to 5 tweets", included: true },
      { name: "View feed", included: true },
      { name: "Like & Retweet", included: true },
      { name: "Edit posts", included: true },
      { name: "Longer posts", included: true },
      { name: "Blue checkmark", included: true },
    ],
    apiName: "SILVER"
  },
  { 
    name: "Gold", 
    price: 1000, 
    limit: "Unlimited", 
    monthly: "₹1,000 / month",
    features: [
      { name: "Unlimited posting", included: true },
      { name: "View feed", included: true },
      { name: "Like & Retweet", included: true },
      { name: "Edit posts", included: true },
      { name: "Longer posts", included: true },
      { name: "Blue checkmark", included: true },
    ],
    apiName: "GOLD"
  },
];

export default function PricingPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><TwitterLogo size="lg" className="animate-pulse text-white" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <TwitterLogo size="xl" className="mb-6" />
        <h1 className="text-3xl font-bold mb-4">Join X Premium today</h1>
        <p className="text-gray-400 mb-8 max-w-md">Please login to upgrade your account and unlock exclusive features like the blue checkmark, post editing, and more.</p>
        <Button onClick={() => window.location.href = '/login'} className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 rounded-full text-lg">
          Log In
        </Button>
      </div>
    );
  }

  const handlePay = async (planApiName: string) => {
    if (!user || !user._id) {
      alert("Please login first");
      return;
    }

    if (planApiName === "FREE") {
      try {
        await axios.post("/api/payment/free-plan", {
          userId: user?._id,
        });
        alert("Free Plan Activated 🎉");
        return;
      } catch (err) {
        alert("Failed to activate free plan");
        return;
      }
    }

    try {
      const res = await axios.post("/api/payment/create-order", {
        plan: planApiName,
        userId: user._id,
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: res.data.amount,
        currency: "INR",
        order_id: res.data.id,
        handler: async (response: any) => {
          await axios.post("/api/payment/verify", {
            paymentId: response.razorpay_payment_id,
            plan: planApiName,
            userId: user._id,
          });
          alert("Subscription Activated 🎉");
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <TwitterLogo size="xl" className="mx-auto mb-6 text-white" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Upgrade your X experience</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get exclusive features like the blue checkmark, post editing, and higher posting limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((p) => (
            <div 
              key={p.name} 
              className={`rounded-2xl p-6 border flex flex-col ${
                p.name === 'Bronze' 
                  ? 'border-blue-500 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative' 
                  : 'border-gray-800 bg-gray-950/30'
              }`}
            >
              {p.name === 'Bronze' && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</span>
                </div>
              )}
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{p.name}</h2>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-extrabold">{p.monthly.split(' ')[0]}</span>
                  {p.price > 0 && <span className="text-gray-400 ml-2">/ month</span>}
                </div>
                <p className="text-gray-400 text-sm">Limit: {p.limit}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {p.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-blue-500 mr-3 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-600 mr-3 shrink-0" />
                    )}
                    <span className={feature.included ? "text-gray-200" : "text-gray-600"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePay(p.apiName)}
                className={`w-full py-6 rounded-full font-bold text-lg transition-all ${
                  p.name === 'Bronze' 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {p.price > 0 ? `Subscribe to ${p.name}` : `Current Plan`}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-2">Subscriptions auto-renew until canceled.</p>
        </div>
      </div>
    </div>
  );
}
