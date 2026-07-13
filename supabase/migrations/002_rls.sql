-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all grammar tables
do $$
declare
  t text;
begin
  foreach t in array array[
    'capabilities','perceptions','sensor_fusion_rules','context_states',
    'interpretations','intents','behavior_policies','joints_and_poses',
    'motion_primitives','projection_primitives','sound_primitives',
    'multimodal_compositions','constraints','monitoring_rules',
    'recovery_rules','behavior_rules','behavior_cases'
  ] loop
    execute format('alter table public.%I enable row level security;', t);

    -- Public: published + not deleted
    execute format('
      create policy "Public can read published"
      on public.%I for select
      to anon, authenticated
      using (status = ''published'' and deleted_at is null);
    ', t, t);

    -- Admin: full read
    execute format('
      create policy "Admin full read"
      on public.%I for select
      to authenticated
      using (public.is_admin());
    ', t, t);

    -- Admin: insert
    execute format('
      create policy "Admin insert"
      on public.%I for insert
      to authenticated
      with check (public.is_admin());
    ', t, t);

    -- Admin: update
    execute format('
      create policy "Admin update"
      on public.%I for update
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
    ', t, t);

    -- Admin: delete (physical, avoid — use soft delete)
    execute format('
      create policy "Admin delete"
      on public.%I for delete
      to authenticated
      using (public.is_admin());
    ', t, t);
  end loop;
end;
$$;

-- RLS on admin_users
alter table public.admin_users enable row level security;

create policy "Admin read admin_users"
on public.admin_users for select
to authenticated
using (public.is_admin());

-- RLS on revisions
alter table public.revisions enable row level security;

create policy "Admin read revisions"
on public.revisions for select
to authenticated
using (public.is_admin());

create policy "Admin insert revisions"
on public.revisions for insert
to authenticated
with check (public.is_admin());
