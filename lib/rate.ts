export const MAX_TRANSACTION_LIMIT = 500000; // 500k KES
export const EXCHANGE_RATE_FACTOR = 0.7; // User gets 70% value

// Hardcoded KES to USD rate for demo (1 USD = ~130 KES)
export const KES_TO_USD_MARKET_RATE = 1 / 130;

export function calculatePayout(amountKES: number): number {
    if (amountKES <= 0) return 0;

    // Convert KES to USD at market rate
    const marketValueUSD = amountKES * KES_TO_USD_MARKET_RATE;

    // Apply the 70% factor
    const payoutValue = marketValueUSD * EXCHANGE_RATE_FACTOR;

    return parseFloat(payoutValue.toFixed(2));
}

export function validateAmount(amountKES: number): string | null {
    if (amountKES > MAX_TRANSACTION_LIMIT) {
        return `Transaction limit is ${MAX_TRANSACTION_LIMIT.toLocaleString()} KES.`;
    }
    if (amountKES <= 0) {
        return "Amount must be greater than 0.";
    }
    return null;
}

export const PAYOUT_METHODS = [
    { id: "CRYPTO", label: "Crypto (USDT)", icon: "Wallet" },
    { id: "MOBILE", label: "Mobile Money", icon: "Smartphone" },
    { id: "BANK", label: "Bank Transfer", icon: "Building" },
    { id: "CASH", label: "Cash (In Person)", icon: "Banknote" },
];
