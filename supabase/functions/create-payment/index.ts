
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
    const { name, email, role } = await req.json()

    // Instamojo API credentials
    const INSTAMOJO_API_KEY = '123456789'
    const INSTAMOJO_AUTH_TOKEN = '987654321'

    // Create payment request to Instamojo
    const paymentData = {
      purpose: `TSCSN Registration - ${role === 'school' ? 'School Coordinator' : 'Supplier'}`,
      amount: '1.00',
      phone: '9999999999',
      buyer_name: name,
      redirect_url: `${req.headers.get('origin')}/payment-success`,
      send_email: true,
      email: email,
      allow_repeated_payments: false
    }

    const formData = new FormData()
    Object.entries(paymentData).forEach(([key, value]) => {
      formData.append(key, value.toString())
    })

    const response = await fetch('https://test.instamojo.com/api/1.1/payment-requests/', {
      method: 'POST',
      headers: {
        'X-Api-Key': INSTAMOJO_API_KEY,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Instamojo API error:', errorText)
      throw new Error(`Instamojo API error: ${response.status}`)
    }

    const result = await response.json()
    console.log('Instamojo response:', result)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store payment record in database
    const { error: dbError } = await supabase
      .from('registration_payments')
      .insert({
        email,
        name,
        role,
        amount: 100, // ₹1 in paise
        payment_id: result.payment_request.id,
        payment_url: result.payment_request.longurl,
        payment_status: 'pending'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to store payment record')
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: result.payment_request.longurl,
        payment_id: result.payment_request.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Payment creation error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create payment'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
