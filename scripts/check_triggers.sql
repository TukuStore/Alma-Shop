-- Check for any triggers on orders table that might be causing issues
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'orders';

-- Also check pg_trigger for more details
SELECT
    tgname,
    tgenabled,
    pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'public.orders'::regclass;
