import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Use env var for Stripe key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

const CheckoutForm = ({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success/${orderId}?method=stripe&amount=${amount}`,
      },
    });

    if (error) {
      setErrorMessage(
        error.message || "Thanh toán thất bại. Vui lòng thử lại.",
      );
      setIsLoading(false);
    }
    // If successful, Stripe automatically redirects to return_url
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && (
        <div className="text-danger text-sm font-medium bg-danger/10 p-3 rounded-md">
          {errorMessage}
        </div>
      )}
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full h-11"
      >
        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
        Thanh toán {amount.toLocaleString("vi-VN")} ₫
      </Button>
    </form>
  );
};

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string | null;
  orderId: string;
  amount: number;
}

export function StripePaymentModal({
  isOpen,
  onClose,
  clientSecret,
  orderId,
  amount,
}: StripePaymentModalProps) {
  return (
    <BaseCrudModal
      open={isOpen}
      onOpenChange={onClose}
      title="Thanh toán an toàn qua Stripe"
      description="Nhập thông tin thẻ quốc tế của bạn. Đơn hàng của bạn sẽ được xác nhận ngay lập tức sau khi thanh toán thành công."
      size="md"
      hideFooter={true}
    >
      <div className="-mx-6 px-6">
        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <CheckoutForm
              orderId={orderId}
              amount={amount}
              onSuccess={onClose}
            />
          </Elements>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
            <p className="text-sm text-ink-muted">{"Đang kết nối cổng thanh toán..."}</p>
          </div>
        )}
      </div>
    </BaseCrudModal>
  );
}
