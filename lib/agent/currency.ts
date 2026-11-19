// The paper portfolio is always denominated in INR. Individual stocks may be
// quoted in other currencies (e.g. US stocks in USD); any money that moves in
// or out of the portfolio must be converted to INR first.

export const BASE_CURRENCY = "₹";

// Static USD/INR reference rate (matches the USD/INR ticker in lib/constants).
export const USD_INR_RATE = 83.92;

const RATES_TO_INR: Record<string, number> = {
    "₹": 1,
    INR: 1,
    "$": USD_INR_RATE,
    USD: USD_INR_RATE,
};

export function getRateToBase(currency: string): number {
    const rate = RATES_TO_INR[currency];
    if (rate === undefined) {
        throw new Error(`No INR conversion rate configured for currency "${currency}"`);
    }
    return rate;
}

/** Convert an amount quoted in `currency` into the portfolio base currency (INR). */
export function toBase(amount: number, currency: string): number {
    return Number((amount * getRateToBase(currency)).toFixed(2));
}
