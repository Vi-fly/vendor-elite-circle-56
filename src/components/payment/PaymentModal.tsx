
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Smartphone, University } from 'lucide-react';
import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDetails: {
    name: string;
    email: string;
    role: 'school' | 'supplier';
  };
  onPaymentSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, userDetails, onPaymentSuccess }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Call our edge function to create payment
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          name: userDetails.name,
          email: userDetails.email,
          role: userDetails.role
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.payment_url) {
        // Redirect to Instamojo payment page
        window.location.href = data.payment_url;
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Complete Registration</DialogTitle>
          <DialogDescription className="text-center">
            Complete your registration with a one-time payment of ₹1
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-navy">Registration Fee</CardTitle>
            <div className="text-4xl font-bold text-teal">₹1</div>
            <CardDescription>
              {userDetails.role === 'school' ? 'School Coordinator' : 'Supplier'} Registration
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Payment Methods Available:</h4>
              <div className="flex justify-around text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  <span>UPI</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </div>
                <div className="flex items-center gap-1">
                  <University className="w-4 h-4" />
                  <span>Net Banking</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Secure payment powered by Instamojo
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1 bg-teal hover:bg-teal/90"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Pay ₹1 & Register'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
