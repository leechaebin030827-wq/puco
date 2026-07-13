-- ============================================================
-- PUCO Behavior Grammar — Database Schema
-- Migration 001: Core Tables
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Status Enum ────────────────────────────────────────────
create type grammar_status as enum ('draft', 'published', 'deprecated');
create type revision_action as enum ('create', 'update', 'publish', 'deprecate', 'delete', 'restore');

-- ─── Admin Users ─────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  email     text not null unique,
  created_at timestamptz not null default now()
);

-- ─── is_admin() function ─────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- ─── Common column macro (applied to each grammar table) ─────
-- id, code, name_ko, name_en, description, status, version,
-- tags, metadata, created_by, updated_by, timestamps

-- ─── Capabilities ────────────────────────────────────────────
create table if not exists public.capabilities (
  id           uuid primary key default uuid_generate_v4(),
  code         text unique not null,
  name_ko      text not null,
  name_en      text,
  description  text,
  status       grammar_status not null default 'draft',
  version      integer not null default 1,
  tags         text[] not null default '{}',
  metadata     jsonb,
  -- Domain fields
  modality     text not null, -- 'input' | 'output'
  sensor_type  text,          -- 'rgb_camera' | 'tof' | 'microphone' | 'projector' | 'speaker' | 'joint_motion'
  available_data text[],
  limitations  text,
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Perceptions ─────────────────────────────────────────────
create table if not exists public.perceptions (
  id                uuid primary key default uuid_generate_v4(),
  code              text unique not null,
  name_ko           text not null,
  name_en           text,
  description       text,
  status            grammar_status not null default 'draft',
  version           integer not null default 1,
  tags              text[] not null default '{}',
  metadata          jsonb,
  -- Domain fields
  sensor            text not null, -- 'camera' | 'tof' | 'microphone'
  category          text not null,
  target            text,
  observable        text not null,
  condition_text    text,
  confidence_level  text not null default 'medium', -- 'low' | 'medium' | 'high'
  output_state_ids  text[],
  failure_condition text,
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Sensor Fusion Rules ─────────────────────────────────────
create table if not exists public.sensor_fusion_rules (
  id                uuid primary key default uuid_generate_v4(),
  code              text unique not null,
  name_ko           text not null,
  name_en           text,
  description       text,
  status            grammar_status not null default 'draft',
  version           integer not null default 1,
  tags              text[] not null default '{}',
  metadata          jsonb,
  -- Domain fields
  input_sensor_ids  text[],
  condition_logic   text,
  output_state_id   text,
  confidence_rule   text,
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Context States ───────────────────────────────────────────
create table if not exists public.context_states (
  id           uuid primary key default uuid_generate_v4(),
  code         text unique not null,
  name_ko      text not null,
  name_en      text,
  description  text,
  status       grammar_status not null default 'draft',
  version      integer not null default 1,
  tags         text[] not null default '{}',
  metadata     jsonb,
  -- Domain fields
  category     text not null, -- 'user' | 'environment' | 'object' | 'task' | 'system'
  evidence_ids text[],
  priority     text not null default 'medium',
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Interpretations ─────────────────────────────────────────
create table if not exists public.interpretations (
  id                    uuid primary key default uuid_generate_v4(),
  code                  text unique not null,
  name_ko               text not null,
  name_en               text,
  description           text,
  status                grammar_status not null default 'draft',
  version               integer not null default 1,
  tags                  text[] not null default '{}',
  metadata              jsonb,
  -- Domain fields
  required_evidence_ids text[],
  required_context_ids  text[],
  confidence_rule       text,
  risk_level            text not null default 'none',
  recommended_intent_ids text[],
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Intents ─────────────────────────────────────────────────
create table if not exists public.intents (
  id              uuid primary key default uuid_generate_v4(),
  code            text unique not null,
  name_ko         text not null,
  name_en         text,
  description     text,
  status          grammar_status not null default 'draft',
  version         integer not null default 1,
  tags            text[] not null default '{}',
  metadata        jsonb,
  -- Domain fields
  purpose         text,
  default_priority text not null default 'medium',
  use_when        text,
  avoid_when      text,
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Behavior Policies ────────────────────────────────────────
create table if not exists public.behavior_policies (
  id                    uuid primary key default uuid_generate_v4(),
  code                  text unique not null,
  name_ko               text not null,
  name_en               text,
  description           text,
  status                grammar_status not null default 'draft',
  version               integer not null default 1,
  tags                  text[] not null default '{}',
  metadata              jsonb,
  -- Domain fields
  initiative            text not null default 'reactive',
  explicitness          text not null default 'moderate',
  intensity             text not null default 'medium',
  persistence           text not null default 'once',
  urgency               text not null default 'normal',
  interruption_tolerance text not null default 'medium',
  applicable_intent_ids text[],
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Joints and Poses ─────────────────────────────────────────
create table if not exists public.joints_and_poses (
  id           uuid primary key default uuid_generate_v4(),
  code         text unique not null,
  name_ko      text not null,
  name_en      text,
  description  text,
  status       grammar_status not null default 'draft',
  version      integer not null default 1,
  tags         text[] not null default '{}',
  metadata     jsonb,
  -- Domain fields
  joint_group  text not null, -- 'head' | 'body' | 'leg'
  pose_description text,
  is_neutral   boolean default false,
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Motion Primitives ────────────────────────────────────────
create table if not exists public.motion_primitives (
  id                   uuid primary key default uuid_generate_v4(),
  code                 text unique not null,
  name_ko              text not null,
  name_en              text,
  description          text,
  status               grammar_status not null default 'draft',
  version              integer not null default 1,
  tags                 text[] not null default '{}',
  metadata             jsonb,
  -- Domain fields
  primary_actuator     text not null, -- 'head' | 'body' | 'leg'
  supporting_actuators text[],
  category             text not null,
  target_type          text,
  direction            text,
  action_description   text not null,
  default_speed        text not null default 'slow',
  default_amplitude    text not null default 'small',
  qualities            text[],
  rhythm               text,
  hold_condition       text,
  exit_motion          text,
  start_pose_id        uuid references public.joints_and_poses(id),
  end_pose_id          uuid references public.joints_and_poses(id),
  -- Sensor integration effects
  camera_effect        text,
  tof_effect           text,
  projection_effect    text,
  audio_compatibility  text,
  required_clearance   text,
  motion_lock          boolean default false,
  -- Relations
  constraint_ids       text[],
  compatible_intent_ids text[],
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Projection Primitives ────────────────────────────────────
create table if not exists public.projection_primitives (
  id              uuid primary key default uuid_generate_v4(),
  code            text unique not null,
  name_ko         text not null,
  name_en         text,
  description     text,
  status          grammar_status not null default 'draft',
  version         integer not null default 1,
  tags            text[] not null default '{}',
  metadata        jsonb,
  -- Domain fields
  function_type   text not null,
  content_type    text not null,
  target_surface  text,
  placement_mode  text,
  scale           text,
  brightness_rule text,
  contrast        text,
  transition_in   text,
  transition_out  text,
  animation_style text,
  duration_rule   text,
  stop_condition  text,
  fallback        text,
  motion_lock     boolean default false,
  -- Relations
  intent_ids      text[],
  motion_ids      text[],
  constraint_ids  text[],
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Sound Primitives ─────────────────────────────────────────
create table if not exists public.sound_primitives (
  id              uuid primary key default uuid_generate_v4(),
  code            text unique not null,
  name_ko         text not null,
  name_en         text,
  description     text,
  status          grammar_status not null default 'draft',
  version         integer not null default 1,
  tags            text[] not null default '{}',
  metadata        jsonb,
  -- Domain fields
  sound_type      text not null, -- 'nonverbal' | 'voice' | 'tone' | 'melody'
  volume_level    text,
  duration_rule   text,
  start_condition text,
  stop_condition  text,
  intent_ids      text[],
  constraint_ids  text[],
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Multimodal Compositions ──────────────────────────────────
create table if not exists public.multimodal_compositions (
  id               uuid primary key default uuid_generate_v4(),
  code             text unique not null,
  name_ko          text not null,
  name_en          text,
  description      text,
  status           grammar_status not null default 'draft',
  version          integer not null default 1,
  tags             text[] not null default '{}',
  metadata         jsonb,
  -- Domain fields
  motion_ids       text[],
  projection_ids   text[],
  sound_ids        text[],
  timing_sequence  jsonb, -- [{step, modality, primitive_id, delay_ms, duration_ms}]
  intent_ids       text[],
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Constraints ─────────────────────────────────────────────
create table if not exists public.constraints (
  id                  uuid primary key default uuid_generate_v4(),
  code                text unique not null,
  name_ko             text not null,
  name_en             text,
  description         text,
  status              grammar_status not null default 'draft',
  version             integer not null default 1,
  tags                text[] not null default '{}',
  metadata            jsonb,
  -- Domain fields
  category            text not null, -- 'safety' | 'hardware' | 'perception' | 'projection' | 'motion' | 'social'
  condition_text      text not null,
  restricted_behavior text,
  required_response   text,
  priority            text not null default 'high',
  related_capability_ids text[],
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Monitoring Rules ─────────────────────────────────────────
create table if not exists public.monitoring_rules (
  id                    uuid primary key default uuid_generate_v4(),
  code                  text unique not null,
  name_ko               text not null,
  name_en               text,
  description           text,
  status                grammar_status not null default 'draft',
  version               integer not null default 1,
  tags                  text[] not null default '{}',
  metadata              jsonb,
  -- Domain fields
  result_type           text not null,
  expected_user_response text,
  monitoring_perception_ids text[],
  timeout_condition     text,
  next_intent_ids       text[],
  maximum_repeat        integer default 2,
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Recovery Rules ───────────────────────────────────────────
create table if not exists public.recovery_rules (
  id                   uuid primary key default uuid_generate_v4(),
  code                 text unique not null,
  name_ko              text not null,
  name_en              text,
  description          text,
  status               grammar_status not null default 'draft',
  version              integer not null default 1,
  tags                 text[] not null default '{}',
  metadata             jsonb,
  -- Domain fields
  trigger_condition    text not null,
  recovery_description text,
  motion_ids           text[],
  projection_ids       text[],
  sound_ids            text[],
  next_intent_ids      text[],
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Behavior Rules ───────────────────────────────────────────
create table if not exists public.behavior_rules (
  id                    uuid primary key default uuid_generate_v4(),
  code                  text unique not null,
  name_ko               text not null,
  name_en               text,
  description           text,
  status                grammar_status not null default 'draft',
  version               integer not null default 1,
  tags                  text[] not null default '{}',
  metadata              jsonb,
  -- Domain fields: WHEN
  trigger_description   text not null,
  required_context_ids  text[],
  -- SENSE
  camera_perception_ids text[],
  tof_perception_ids    text[],
  mic_perception_ids    text[],
  -- FUSE
  fusion_rule_ids       text[],
  condition_logic       text,
  -- INTERPRET
  interpretation_id     text,
  -- DECIDE
  intent_id             text not null,
  policy_id             text,
  priority              text not null default 'medium',
  -- EXPRESS
  motion_ids            text[],
  motion_modifier       jsonb,
  projection_ids        text[],
  projection_modifier   jsonb,
  sound_ids             text[],
  composition_ids       text[],
  -- MONITOR
  expected_response     text,
  monitoring_rule_ids   text[],
  -- RECOVER
  recovery_rule_ids     text[],
  constraint_ids        text[],
  exit_condition        text,
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Behavior Cases ───────────────────────────────────────────
create table if not exists public.behavior_cases (
  id                  uuid primary key default uuid_generate_v4(),
  code                text unique not null,
  name_ko             text not null,
  name_en             text,
  description         text,
  status              grammar_status not null default 'draft',
  version             integer not null default 1,
  tags                text[] not null default '{}',
  metadata            jsonb,
  -- Domain fields
  scenario_input      text not null,
  scenario_categories text[],
  extracted_context_ids text[],
  selected_rule_ids   text[],
  camera_output       text,
  tof_output          text,
  mic_output          text,
  interpretation_output text,
  motion_output       text,
  projection_output   text,
  sound_output        text,
  timing_output       jsonb,
  monitoring_output   text,
  recovery_output     text,
  usage_example       text,
  -- Audit
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  deleted_at   timestamptz
);

-- ─── Revisions ────────────────────────────────────────────────
create table if not exists public.revisions (
  id          uuid primary key default uuid_generate_v4(),
  entity_type text not null,
  entity_id   uuid not null,
  entity_code text,
  action      revision_action not null,
  before_data jsonb,
  after_data  jsonb,
  actor_id    uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

-- ─── Updated_at trigger ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply trigger to all grammar tables
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
    execute format('
      create trigger set_updated_at
      before update on public.%I
      for each row execute function public.set_updated_at();
    ', t);
  end loop;
end;
$$;
