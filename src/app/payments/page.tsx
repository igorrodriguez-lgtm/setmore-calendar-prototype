import { Suspense } from "react";
import { PaymentsPrototype } from "@/components/payments/PaymentsPrototype";

export default function PaymentsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentsPrototype />
    </Suspense>
  );
}
