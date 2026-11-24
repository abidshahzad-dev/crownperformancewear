-- Newer Supabase projects no longer grant public-schema tables to the API roles automatically.
-- The service role (used by scripts/create-admin.ts and Admin → Users) needs explicit access.
-- It bypasses row level security by design, so it is only ever used server-side.

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;

-- Identity columns (search_queries.id) also need sequence usage for API inserts.
grant usage, select on all sequences in schema public to anon, authenticated;
