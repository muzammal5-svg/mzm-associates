UPDATE public.payment_accounts
SET account_number = 'PK82ASCM0001150200000155',
    account_title = 'Muhammad Zahid Muneer',
    bank_name = 'Askari Bank',
    instructions = 'Transfer to Askari Bank and share transaction ID / receipt'
WHERE method = 'bank_transfer';
