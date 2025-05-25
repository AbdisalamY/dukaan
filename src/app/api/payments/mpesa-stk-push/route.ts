// src/app/api/payments/mpesa-stk-push/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface MpesaSTKPushRequest {
  phoneNumber: string;
  amount: number;
  shopName: string;
  accountReference: string;
  transactionDesc: string;
}

interface MpesaAccessTokenResponse {
  access_token: string;
  expires_in: string;
}

interface MpesaSTKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MpesaSTKPushRequest = await request.json();
    const { phoneNumber, amount, shopName, accountReference, transactionDesc } = body;

    // Validate required fields
    if (!phoneNumber || !amount || !shopName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^254\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get M-Pesa credentials from environment variables
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!consumerKey || !consumerSecret || !businessShortCode || !passkey || !callbackUrl) {
      console.error('Missing M-Pesa configuration');
      return NextResponse.json(
        { success: false, message: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    // Step 1: Get access token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get M-Pesa access token');
    }

    const tokenData: MpesaAccessTokenResponse = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

    // Step 3: Initiate STK Push
    const stkPushPayload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // M-Pesa requires integer amounts
      PartyA: phoneNumber,
      PartyB: businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushPayload),
    });

    if (!stkResponse.ok) {
      throw new Error('Failed to initiate M-Pesa STK Push');
    }

    const stkData: MpesaSTKPushResponse = await stkResponse.json();

    // Check if the request was successful
    if (stkData.ResponseCode === '0') {
      // Store the transaction details in the database
      try {
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();
        
        // Create a payment record with M-Pesa details
        const { data: payment, error: dbError } = await supabase
          .from('payments')
          .insert({
            shop_id: null, // You might want to pass shop_id in the request
            amount: Math.round(amount),
            currency: 'KES',
            status: 'pending',
            payment_method: 'M-Pesa',
            due_date: new Date().toISOString(),
            mpesa_checkout_request_id: stkData.CheckoutRequestID,
            mpesa_merchant_request_id: stkData.MerchantRequestID,
            phone_number: phoneNumber,
            notes: transactionDesc
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          // Continue anyway, as the M-Pesa request was successful
        }
      } catch (dbError) {
        console.error('Failed to store payment record:', dbError);
        // Continue anyway, as the M-Pesa request was successful
      }
      
      return NextResponse.json({
        success: true,
        message: 'Payment request sent successfully',
        data: {
          merchantRequestId: stkData.MerchantRequestID,
          checkoutRequestId: stkData.CheckoutRequestID,
          customerMessage: stkData.CustomerMessage,
        },
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: stkData.ResponseDescription || 'Payment request failed' 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('M-Pesa STK Push error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// Handle M-Pesa callback (this would be called by Safaricom)
export async function PUT(request: NextRequest) {
  try {
    const callbackData = await request.json();
    
    // Process the callback data
    console.log('M-Pesa Callback received:', callbackData);
    
    // Extract relevant information
    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    if (stkCallback) {
      const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;
      
      try {
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();
        
        // Update payment status based on the result
        if (ResultCode === 0) {
          // Payment successful - extract transaction details
          let mpesaReceiptNumber = '';
          let transactionDate = '';
          let phoneNumber = '';
          
          if (CallbackMetadata && CallbackMetadata.Item) {
            for (const item of CallbackMetadata.Item) {
              switch (item.Name) {
                case 'MpesaReceiptNumber':
                  mpesaReceiptNumber = item.Value;
                  break;
                case 'TransactionDate':
                  transactionDate = item.Value;
                  break;
                case 'PhoneNumber':
                  phoneNumber = item.Value;
                  break;
              }
            }
          }
          
          // Update payment record
          const { error: updateError } = await supabase
            .from('payments')
            .update({
              status: 'paid',
              payment_date: new Date().toISOString(),
              transaction_id: mpesaReceiptNumber,
              mpesa_receipt_number: mpesaReceiptNumber,
              phone_number: phoneNumber || undefined
            })
            .eq('mpesa_checkout_request_id', CheckoutRequestID);
          
          if (updateError) {
            console.error('Failed to update payment status:', updateError);
          } else {
            console.log('Payment successful:', { 
              MerchantRequestID, 
              CheckoutRequestID, 
              mpesaReceiptNumber 
            });
          }
        } else {
          // Payment failed
          const { error: updateError } = await supabase
            .from('payments')
            .update({
              status: 'failed',
              notes: ResultDesc
            })
            .eq('mpesa_checkout_request_id', CheckoutRequestID);
          
          if (updateError) {
            console.error('Failed to update payment status:', updateError);
          } else {
            console.log('Payment failed:', { 
              MerchantRequestID, 
              CheckoutRequestID, 
              ResultDesc 
            });
          }
        }
      } catch (dbError) {
        console.error('Database error in callback:', dbError);
      }
    }
    
    // Always return success to M-Pesa
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    // Still return success to avoid M-Pesa retrying
    return NextResponse.json({ success: true });
  }
}
