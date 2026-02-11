export const MAX_TRANSACTION_LIMIT = 500000; // 500k KES
export const EXCHANGE_RATE_FACTOR = 0.7; // User gets 70% value

// Hardcoded KES to USD rate for demo (1 USD = ~130 KES)
// In production, fetch from an API
export const KES_TO_USD_MARKET_RATE = 1 / 130;

export function calculateUSDT(amountKES: number): number {
    if (amountKES <= 0) return 0;

    // Convert KES to USD at market rate
    const marketValueUSD = amountKES * KES_TO_USD_MARKET_RATE;

    // Apply the 70% factor
    // "70 cents on the shilling" implies for every 1 unit of value input, they get 0.7 units output.
    // Interpretation: 100 KES -> Market Value in USD -> * 0.7
    const payoutUSDT = marketValueUSD * EXCHANGE_RATE_FACTOR;

    return parseFloat(payoutUSDT.toFixed(2));
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
