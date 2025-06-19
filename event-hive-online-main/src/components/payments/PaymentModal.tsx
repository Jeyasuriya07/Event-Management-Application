
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { PaymentMethod } from "@/types";
import { PAYMENT_METHODS } from "@/lib/constants";
import { CreditCard, Smartphone, Check } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (paymentMethod: PaymentMethod) => void;
  title: string;
  description: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  onSuccess,
  title,
  description
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setNameOnCard("");
    setUpiId("");
    setIsProcessing(false);
    setPaymentSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form based on payment method
    if (paymentMethod === "Card") {
      if (!cardNumber || !expiry || !cvv || !nameOnCard) {
        toast({
          title: "Error",
          description: "Please fill out all card details",
          variant: "destructive",
        });
        return;
      }
      
      if (cardNumber.replace(/\s/g, "").length !== 16) {
        toast({
          title: "Error",
          description: "Invalid card number",
          variant: "destructive",
        });
        return;
      }
    } else if ((paymentMethod === "UPI" || paymentMethod === "GPay") && !upiId) {
      toast({
        title: "Error",
        description: "Please enter a valid UPI ID",
        variant: "destructive",
      });
      return;
    }

    // Simulate payment processing
    setIsProcessing(true);
    
    // Simulate API request with timeout
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // After showing success for a moment, close and trigger success callback
      setTimeout(() => {
        onSuccess(paymentMethod);
        handleClose();
      }, 1500);
    }, 2000);
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (input: string) => {
    const digits = input.replace(/\D/g, "").substring(0, 16);
    const groups = [];
    
    for (let i = 0; i < digits.length; i += 4) {
      groups.push(digits.substring(i, i + 4));
    }
    
    return groups.join(" ");
  };

  // Format expiry date as MM/YY
  const formatExpiry = (input: string) => {
    const digits = input.replace(/\D/g, "").substring(0, 4);
    
    if (digits.length > 2) {
      return digits.substring(0, 2) + "/" + digits.substring(2);
    }
    
    return digits;
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "Card":
        return <CreditCard className="h-5 w-5 mr-2" />;
      case "UPI":
      case "GPay":
        return <Smartphone className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {paymentSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-600 mb-2">Payment Successful!</h3>
            <p className="text-gray-500 mb-6">
              Your payment of ₹{amount.toLocaleString()} has been processed successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Payment Amount</h3>
              <div className="text-2xl font-bold text-eventhub-purple">₹{amount.toLocaleString()}</div>
            </div>

            <div className="space-y-4">
              <Label>Payment Method</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="grid grid-cols-3 gap-2"
              >
                {PAYMENT_METHODS.map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <RadioGroupItem value={method} id={`payment-${method}`} />
                    <Label htmlFor={`payment-${method}`} className="flex items-center cursor-pointer">
                      {getPaymentMethodIcon(method as PaymentMethod)}
                      {method}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {paymentMethod === "Card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name-on-card">Name on Card</Label>
                  <Input
                    id="name-on-card"
                    placeholder="John Smith"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(paymentMethod === "UPI" || paymentMethod === "GPay") && (
              <div className="space-y-2">
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input
                  id="upi-id"
                  placeholder="name@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter your UPI ID to make the payment
                </p>
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-eventhub-purple hover:bg-eventhub-purple-dark"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Pay ₹${amount.toLocaleString()}`}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
