-- Add M-Pesa specific fields to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id TEXT,
ADD COLUMN IF NOT EXISTS mpesa_merchant_request_id TEXT,
ADD COLUMN IF NOT EXISTS mpesa_receipt_number TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for M-Pesa checkout request ID for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_mpesa_checkout_request_id ON public.payments (mpesa_checkout_request_id);

-- Create index for phone number
CREATE INDEX IF NOT EXISTS idx_payments_phone_number ON public.payments (phone_number);

-- Add comment to document the new fields
COMMENT ON COLUMN public.payments.mpesa_checkout_request_id IS 'M-Pesa STK Push checkout request ID for tracking payment status';

COMMENT ON COLUMN public.payments.mpesa_merchant_request_id IS 'M-Pesa merchant request ID for transaction tracking';

COMMENT ON COLUMN public.payments.mpesa_receipt_number IS 'M-Pesa receipt number for successful payments';

COMMENT ON COLUMN public.payments.phone_number IS 'Phone number used for M-Pesa payment';