-- Enable the pg_net extension if not already enabled (required for http_request)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function: Trigger the push-notification edge function
CREATE OR REPLACE FUNCTION public.trigger_push_notification_webhook()
RETURNS trigger AS $$
BEGIN
  -- We call the Supabase Edge Function URL asynchronously
  -- NOTE: The user must replace the endpoint URL with their actual Supabase project reference
  PERFORM net.http_post(
      -- The URL to your deployed edge function
      url := 'https://' || current_setting('request.headers')::json->>'origin' || '/functions/v1/push-notification',
      -- You can also explicitly hardcode your URL if the origin header trick fails:
      -- url := 'https://fhkzfwebhcyxhrnojwra.supabase.co/functions/v1/push-notification',
      
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        -- Use the anon key or service role key to authenticate the function call
        'Authorization', 'Bearer ' || current_setting('request.jwt.claim.role', true)
      ),
      body := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW)
      )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the notifications table
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;

CREATE TRIGGER on_notification_created
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.trigger_push_notification_webhook();
