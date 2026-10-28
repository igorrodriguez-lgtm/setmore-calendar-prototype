import type { Metadata } from "next";
import "./payments.css";

export const metadata: Metadata = {
  title: "Payments · Before / After",
  description: "Setmore Payments settings: the current design next to the improved one, in every account state.",
};

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
