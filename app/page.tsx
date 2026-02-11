"use client";

import { useState, useEffect } from "react";
import { calculatePayout, validateAmount } from "@/lib/rate";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import ChatWidget from "@/components/ChatWidget";
import UserProfile from "@/components/UserProfile";
import dynamic from "next/dynamic";
import AmountStep from "@/components/wizard/AmountStep";
import MethodStep from "@/components/wizard/MethodStep";
import DetailsStep from "@/components/wizard/DetailsStep";

const SummaryStep = dynamic(() => import("@/components/wizard/SummaryStep"), { ssr: false });

import SuccessStep from "@/components/wizard/SuccessStep";

import { ShieldCheck, Copy, User } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { user, login, loading: authLoading } = useAuth();
  useAnalytics(); // Initialize tracking

  // Wizard State
  const [step, setStep] = useState(1);
  const [kesAmount, setKesAmount] = useState<string>("");
  const [usdValue, setUsdValue] = useState<number>(0);
  const [method, setMethod] = useState("CRYPTO");
  const [details, setDetails] = useState<any>({});
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  // UX State
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [hasNotifiedAuth, setHasNotifiedAuth] = useState(false);

  // Auto-Login & Notification
  useEffect(() => {
    if (!user && !authLoading) {
      login();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && !hasNotifiedAuth) {
      toast.success("Anonymous Identity Created", {
        description: "Click to view your secret credentials.",
        action: {
          label: "View Identity",
          onClick: () => setShowProfile(true)
        },
        duration: 8000
      });
      setHasNotifiedAuth(true);
    }
  }, [user, hasNotifiedAuth]);

  // Rate Calculation
  useEffect(() => {
    const amount = parseFloat(kesAmount);
    if (!isNaN(amount)) {
      setUsdValue(calculatePayout(amount));
      setError(validateAmount(amount));
    } else {
      setUsdValue(0);
      setError(null);
    }
  }, [kesAmount]);

  const handleNext = () => {
    if (step === 1 && (error || !kesAmount)) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handlePaystackSuccess = async (reference: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference.reference,
          amount: parseFloat(kesAmount),
          email: email || `user_${user?.uid?.slice(0, 6)}@kihumba.com`,
          payoutMethod: method,
          payoutDetails: details,
          userId: user?.uid
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrderData(data.order);
        setStep(5); // Move to Success Step
        toast.success("Transaction Initiated!");
      } else {
        toast.error("Failed to record transaction. Please contact support.");
      }

    } catch (err) {
      console.error(err);
      toast.error("An error occurred recording your transaction.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Top Bar for Profile Access */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2 bg-accent/30 hover:bg-accent/50 border border-border rounded-full px-4 py-2 transition-all backdrop-blur-sm"
        >
          <div className="bg-primary/20 p-1 rounded-full">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-bold hidden sm:inline">My Identity</span>
        </button>
      </div>

      <UserProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />

      <div className="z-10 w-full max-w-md space-y-8 relative">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            GhostSwap
          </h1>
          <p className="text-muted-foreground">
            Anonymize your money. Any method.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl backdrop-blur-sm min-h-[400px]">
          {step === 1 && (
            <AmountStep
              amount={kesAmount}
              setAmount={setKesAmount}
              usdValue={usdValue}
              error={error}
              onNext={handleNext}
            />
          )}
          {step === 2 && (
            <MethodStep
              selectedMethod={method}
              setSelectedMethod={setMethod}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <DetailsStep
              method={method}
              details={details}
              setDetails={setDetails}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 4 && (
            <SummaryStep
              amount={parseFloat(kesAmount)}
              usdValue={usdValue}
              method={method}
              details={details}
              email={email}
              setEmail={setEmail}
              onPaySuccess={handlePaystackSuccess}
              onBack={handleBack}
            />
          )}
          {step === 5 && orderData && (
            <SuccessStep
              amount={parseFloat(kesAmount)}
              method={method}
              orderId={orderData.id}
              onReset={() => {
                setStep(1);
                setKesAmount("");
                setOrderData(null);
              }}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>Encrypted Data</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Copy className="h-6 w-6 text-secondary" />
            <span>Manual Fulfillment</span>
          </div>
        </div>
      </div>

      <ChatWidget />
    </main>
  );
}
