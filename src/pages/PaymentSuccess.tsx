
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get('payment_id');
      const paymentRequestId = searchParams.get('payment_request_id');

      if (!paymentId || !paymentRequestId) {
        toast({
          title: "Error",
          description: "Payment verification failed. Missing payment details.",
          variant: "destructive",
        });
        navigate('/register');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            payment_id: paymentId,
            payment_request_id: paymentRequestId
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.payment_verified) {
          setPaymentVerified(true);
          toast({
            title: "Payment Successful",
            description: "Your registration payment has been verified!",
          });
        } else {
          throw new Error('Payment verification failed');
        }

      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Verification Failed",
          description: error.message || "Could not verify payment. Please contact support.",
          variant: "destructive",
        });
        navigate('/register');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, toast]);

  if (isVerifying) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <CardTitle>Verifying Payment</CardTitle>
                <CardDescription>
                  Please wait while we verify your payment...
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Payment Successful!</CardTitle>
              <CardDescription>
                Your registration payment of ₹1 has been processed successfully.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                You can now complete your account registration. You will receive a confirmation email shortly.
              </p>
              
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-teal hover:bg-teal/90"
              >
                Continue to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
