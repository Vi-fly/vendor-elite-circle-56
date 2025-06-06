
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { payment_id, payment_request_id } = await req.json()
    console.log('Verifying payment:', { payment_id, payment_request_id })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if this is a test payment
    if (payment_request_id && payment_request_id.startsWith('test_request_')) {
      console.log('Processing test payment verification')
      
      // Update payment status in database for test payment
      const { error: updateError } = await supabase
        .from('registration_payments')
        .update({
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', payment_request_id)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw new Error('Failed to update payment status')
      }

      return new Response(
        JSON.stringify({
          success: true,
          payment_status: 'completed',
          payment_verified: true,
          message: 'Test payment verified successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // For real payments, verify with Instamojo
    const INSTAMOJO_API_KEY = '123456789'
    const INSTAMOJO_AUTH_TOKEN = '987654321'

    console.log('Making verification request to Instamojo...')

    const response = await fetch(`https://test.instamojo.com/api/1.1/payments/${payment_id}/`, {
      method: 'GET',
      headers: {
        'X-Api-Key': INSTAMOJO_API_KEY,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
      }
    })

    if (!response.ok) {
      console.error(`Instamojo verification failed: ${response.status}`)
      throw new Error(`Instamojo verification failed: ${response.status}`)
    }

    const result = await response.json()
    console.log('Payment verification result:', result)

    // Update payment status in database
    const paymentStatus = result.payment.status === 'Credit' ? 'completed' : 'failed'
    
    const { error: updateError } = await supabase
      .from('registration_payments')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', payment_request_id)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error('Failed to update payment status')
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_status: paymentStatus,
        payment_verified: paymentStatus === 'completed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to verify payment'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
