"use client";

import { MapPin, ArrowRight, ArrowLeft } from "lucide-react";

interface PayoutDetails {
    walletAddress?: string;
    network?: string;
    phoneNumber?: string;
    provider?: string;
    accountNumber?: string;
    bankName?: string;
    location?: string;
    contact?: string;
    description?: string; // For cash/in-person
}

interface DetailsStepProps {
    method: string;
    details: PayoutDetails;
    setDetails: (val: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function DetailsStep({ method, details, setDetails, onNext, onBack }: DetailsStepProps) {

    const renderFields = () => {
        switch (method) {
            case "CRYPTO":
                return (
                    <div className="space-y-4">
                        <div className="bg-primary/10 p-3 rounded text-xs text-primary border border-primary/20">
                            Ensure network matches. Transfers are irreversible.
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Select Network</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["TRC20", "ERC20", "TON", "BTC"].map(net => (
                                    <button
                                        key={net}
                                        onClick={() => setDetails({ ...details, network: net })}
                                        className={`p-2 rounded text-xs font-bold border ${details.network === net ? 'bg-primary text-black border-primary' : 'bg-accent/20 border-border text-gray-400'}`}
                                    >
                                        {net}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Wallet Address</label>
                            <input
                                type="text"
                                value={details.walletAddress || ""}
                                onChange={(e) => setDetails({ ...details, walletAddress: e.target.value })}
                                placeholder={details.network === "BTC" ? "bc1..." : "T..."}
                                className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                            />
                        </div>
                    </div>
                );
            case "MOBILE":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Provider</label>
                            <select
                                className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={details.provider || "MPESA"}
                                onChange={(e) => setDetails({ ...details, provider: e.target.value })}
                            >
                                <option value="MPESA">M-Pesa</option>
                                <option value="AIRTEL">Airtel Money</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Phone Number</label>
                            <input
                                type="text"
                                value={details.phoneNumber || ""}
                                onChange={(e) => setDetails({ ...details, phoneNumber: e.target.value })}
                                placeholder="07..."
                                className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                            />
                        </div>
                    </div>
                );
            case "BANK":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Bank Name</label>
                            <input
                                type="text"
                                value={details.bankName || ""}
                                onChange={(e) => setDetails({ ...details, bankName: e.target.value })}
                                placeholder="e.g. KCB, Equity"
                                className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Account Number</label>
                            <input
                                type="text"
                                value={details.accountNumber || ""}
                                onChange={(e) => setDetails({ ...details, accountNumber: e.target.value })}
                                placeholder="Account No."
                                className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                            />
                        </div>
                    </div>
                )
            case "CASH":
                return (
                    <div className="space-y-4">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-yellow-500 text-xs flex gap-2">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <p>We will initiate a secure, private meet-up. Please be descriptive about your location.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">City / Location</label>
                            <input
                                type="text"
                                value={details.location || ""}
                                onChange={(e) => setDetails({ ...details, location: e.target.value })}
                                placeholder="e.g. Nairobi CBD, Westlands (Near Mall)"
                                className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Visual Description / Notes</label>
                            <textarea
                                value={details.description || ""}
                                onChange={(e) => setDetails({ ...details, description: e.target.value })}
                                placeholder="e.g. Wearing a black hoodie, waiting near the entrance."
                                className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Contact (Signal/Telegram)</label>
                            <input
                                type="text"
                                value={details.contact || ""}
                                onChange={(e) => setDetails({ ...details, contact: e.target.value })}
                                placeholder="@username"
                                className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Payout Details</h2>
                <p className="text-xs text-muted-foreground">Where should we send the money?</p>
            </div>

            {renderFields()}

            <div className="flex gap-3 pt-4">
                <button onClick={onBack} className="px-4 py-3 rounded-lg bg-accent/50 hover:bg-accent text-white transition-all">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    Review & Pay <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
