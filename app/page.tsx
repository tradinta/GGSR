"use client";

import { useState, useEffect } from "react";
import { calculateUSDT, validateAmount } from "@/lib/rate";
import { Copy, Wallet, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [kesAmount, setKesAmount] = useState<string>("");
  const [usdtAmount, setUsdtAmount] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const amount = parseFloat(kesAmount);
    if (!isNaN(amount)) {
      setUsdtAmount(calculateUSDT(amount));
      setError(validateAmount(amount));
    } else {
      setUsdtAmount(0);
      setError(null);
    }
  }, [kesAmount]);

  const handlePayment = async () => {
    if (error || !kesAmount || !walletAddress || !email) return;

    setLoading(true);
    try {
      const response = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(kesAmount),
          email,
          walletAddress,
        }),
      });

      const data = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert("Payment initialization failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            GhostSwap
          </h1>
          <p className="text-muted-foreground">
            Anonymous. Fast. Secure.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl backdrop-blur-sm">
          <div className="space-y-4">
            {/* KES Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">You Send (KES)</label>
              <div className="relative">
                <input
                  type="number"
                  value={kesAmount}
                  onChange={(e) => setKesAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-accent/50 border border-border rounded-lg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">KES</span>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>

            <div className="flex justify-center">
              <ArrowRight className="text-muted-foreground rotate-90 md:rotate-90" />
            </div>

            {/* USDT Output */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">You Receive (USDT)</label>
              <div className="relative">
                <input
                  type="text"
                  value={usdtAmount}
                  readOnly
                  className="w-full bg-accent/50 border border-border rounded-lg p-3 text-lg text-primary font-bold focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">USDT</span>
              </div>
              <p className="text-xs text-muted-foreground text-right">Rate: 70% Value</p>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium text-muted-foreground">USDT Wallet Address (TRC20)</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="T..."
                  className="w-full bg-accent/50 border border-border rounded-lg p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email (For Receipt)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anon@example.com"
                className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !!error || !kesAmount || !walletAddress || !email}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Zap className="h-5 w-5" /> Buy USDT Now
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>No KYC Required</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Copy className="h-6 w-6 text-secondary" />
            <span>Instant Processing</span>
          </div>
        </div>
      </div>
    </main>
  );
}
