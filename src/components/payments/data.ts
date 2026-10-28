/** Fake data for the Payments prototype. Invented names, links and amounts; nothing from a real account. */

export interface Sale {
  created: string;
  customer: string;
  status: "Paid" | "Refund initiated" | "Deposit" | "Refunded" | "Failed";
  value: number;
  bookingId: string | null;
}

export const SALES: Sale[] = [
  { created: "17 Mar 2025 · 12:00 AM", customer: "Tatiana Lipshutz", status: "Paid", value: 43, bookingId: "AOAL4TX3" },
  { created: "18 Mar 2025 · 12:34 AM", customer: "Marcus Mango", status: "Refund initiated", value: 43, bookingId: "AOAL4TX2" },
  { created: "21 Mar 2025 · 1:30 PM", customer: "Kevin Payne", status: "Deposit", value: 120, bookingId: "AOAL4TX5" },
  { created: "29 Feb 2025 · 2:32 PM", customer: "Quick payment", status: "Paid", value: 44, bookingId: null },
  { created: "24 Feb 2025 · 4:20 PM", customer: "Wilson Lipshutz", status: "Paid", value: 12, bookingId: "AOAL4TX7" },
];

export interface Transaction {
  date: string;
  customer: string;
  amount: number;
  type: "Charge" | "Refund" | "Deposit";
  method: "Card" | "Cash";
}

export const TRANSACTIONS: Transaction[] = [
  { date: "17 Mar 2025 · 12:00 AM", customer: "Tatiana Lipshutz", amount: 43, type: "Charge", method: "Card" },
  { date: "18 Mar 2025 · 12:34 AM", customer: "Marcus Mango", amount: -43, type: "Refund", method: "Card" },
  { date: "21 Mar 2025 · 1:30 PM", customer: "Kevin Payne", amount: 120, type: "Deposit", method: "Card" },
  { date: "29 Feb 2025 · 2:32 PM", customer: "Quick payment", amount: 44, type: "Charge", method: "Cash" },
];

export type LinkStatus = "Paid" | "Pending" | "Deactivated" | "Expired" | "Failed" | "Refunded";

export interface PaymentLink {
  created: string;
  url: string;
  amount: number;
  status: LinkStatus;
  customer: string;
  note: string | null;
}

/** After shows every link, including the ones Before hides (deactivated, expired, failed, refunded). */
export const LINKS: PaymentLink[] = [
  { created: "17 Aug 2026 · 4:34 PM", url: "https://buy.stripe.com/test_9AQ…I7sE6SX6o0", amount: 43, status: "Paid", customer: "Tatiana Lipshutz", note: null },
  { created: "17 Aug 2026 · 12:00 AM", url: "https://buy.stripe.com/test_3fK…P2wQ8LmA1", amount: 150.24, status: "Pending", customer: "Quick payment", note: null },
  { created: "12 Aug 2026 · 8:00 PM", url: "https://buy.stripe.com/test_7cE…T4rN0ZqB2", amount: 120, status: "Pending", customer: "Quick payment", note: "Balance for the April colour session." },
  { created: "11 Aug 2026 · 9:15 AM", url: "https://buy.stripe.com/test_5dW…H8kD2YuC3", amount: 60, status: "Deactivated", customer: "Ana Ruiz", note: "Sent with the wrong amount." },
  { created: "10 Aug 2026 · 6:30 PM", url: "https://buy.stripe.com/test_1mR…V6jS4XeD4", amount: 44, status: "Expired", customer: "Quick payment", note: null },
  { created: "09 Aug 2026 · 2:10 PM", url: "https://buy.stripe.com/test_8pL…N1gF7WaE5", amount: 85, status: "Failed", customer: "Jonah Webb", note: null },
  { created: "08 Aug 2026 · 11:45 AM", url: "https://buy.stripe.com/test_2tB…K3hJ9QsF6", amount: 30, status: "Refunded", customer: "Mia Chen", note: null },
  { created: "06 Aug 2026 · 4:00 PM", url: "https://buy.stripe.com/test_6yX…M5nL1RpG7", amount: 12, status: "Paid", customer: "Wilson Lipshutz", note: null },
];

export const BALANCE = { available: 3240.5, upcoming: 3240.5, payoutDate: "6 Jul" };

/** "$3,240.50": one currency sign, grouping, two decimals. Never "$$". */
export function money(amount: number): string {
  const sign = amount < 0 ? "−" : "";
  return `${sign}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** The checkout preview in both versions. After's total is the sum of its lines; Before keeps Figma's figures. */
export const CHECKOUT = {
  service: { name: "Haircut & blow dry", when: "Tue, 14 Oct · 10:30 AM", total: 80 },
  fee: 8.5,
  promo: { code: "FIRST10", off: 8 },
  depositRate: 0.25,
};
