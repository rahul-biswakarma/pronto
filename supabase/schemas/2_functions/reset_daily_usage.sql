create or replace function public.reset_daily_usage()
returns void
language plpgsql
security definer
as $$
begin
  update public.user_usage
  set daily_llm_requests = 0, updated_at = now()
  where daily_llm_requests > 0;
end;
$$;
