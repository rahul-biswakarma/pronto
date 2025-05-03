create type "public"."canvas_entity_type" as enum ('html', 'text', 'url', 'scribble', 'image');

create table "public"."assets" (
    "id" uuid not null default gen_random_uuid(),
    "created_by" uuid not null,
    "website_id" uuid,
    "file_path" text not null,
    "file_size" integer not null,
    "file_type" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."assets" enable row level security;

create table "public"."canvas_entities" (
    "id" uuid not null default gen_random_uuid(),
    "entity_type" canvas_entity_type not null,
    "content" text,
    "html_variant_id" uuid,
    "x" double precision not null,
    "y" double precision not null,
    "width" double precision,
    "height" double precision,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."canvas_entities" enable row level security;

create table "public"."canvas_workspaces" (
    "id" uuid not null default gen_random_uuid(),
    "website_id" uuid not null,
    "name" text not null,
    "is_active" boolean default true,
    "created_by" uuid not null,
    "updated_by" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."canvas_workspaces" enable row level security;

create table "public"."collaborators" (
    "id" uuid not null default gen_random_uuid(),
    "website_id" uuid not null,
    "created_by" uuid not null,
    "invited_by" uuid not null,
    "role" text not null default 'editor'::text,
    "status" text default 'invited'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."collaborators" enable row level security;

create table "public"."domains" (
    "id" uuid not null default gen_random_uuid(),
    "domain" text not null,
    "created_by" uuid not null,
    "website_id" uuid not null,
    "is_custom" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."domains" enable row level security;

create table "public"."invites" (
    "id" uuid not null default gen_random_uuid(),
    "website_id" uuid not null,
    "email" text not null,
    "status" text default 'pending'::text,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."invites" enable row level security;

create table "public"."plans" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "max_websites" integer,
    "max_routes_per_website" integer,
    "max_llm_requests_per_day" integer,
    "max_storage_mb" integer,
    "created_at" timestamp with time zone default now()
);


create table "public"."routes" (
    "id" uuid not null default gen_random_uuid(),
    "website_id" uuid not null,
    "path" text not null,
    "published_variant_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid not null,
    "updated_by" uuid not null
);


alter table "public"."routes" enable row level security;

create table "public"."user_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "created_by" uuid not null,
    "plan_id" uuid not null,
    "subscribed_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone
);


alter table "public"."user_subscriptions" enable row level security;

create table "public"."user_usage" (
    "id" uuid not null default gen_random_uuid(),
    "created_by" uuid not null,
    "daily_llm_requests" integer default 0,
    "total_llm_requests" integer default 0,
    "asset_storage_used_mb" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_usage" enable row level security;

create table "public"."website_variants" (
    "id" uuid not null default gen_random_uuid(),
    "route_id" uuid not null,
    "website_id" uuid not null,
    "html_path" text not null,
    "is_selected" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid not null,
    "updated_by" uuid not null
);


alter table "public"."website_variants" enable row level security;

create table "public"."websites" (
    "id" uuid not null default gen_random_uuid(),
    "created_by" uuid not null,
    "updated_by" uuid not null,
    "domain" text not null,
    "is_published" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "is_first_visit" boolean default true
);


alter table "public"."websites" enable row level security;

CREATE UNIQUE INDEX assets_pkey ON public.assets USING btree (id);

CREATE UNIQUE INDEX canvas_entities_pkey ON public.canvas_entities USING btree (id);

CREATE UNIQUE INDEX canvas_workspaces_pkey ON public.canvas_workspaces USING btree (id);

CREATE UNIQUE INDEX collaborators_pkey ON public.collaborators USING btree (id);

CREATE UNIQUE INDEX collaborators_website_id_created_by_key ON public.collaborators USING btree (website_id, created_by);

CREATE UNIQUE INDEX domains_domain_key ON public.domains USING btree (domain);

CREATE UNIQUE INDEX domains_pkey ON public.domains USING btree (id);

CREATE INDEX idx_assets_created_by ON public.assets USING btree (created_by);

CREATE INDEX idx_assets_website_id ON public.assets USING btree (website_id);

CREATE INDEX idx_canvas_entities_variant_id ON public.canvas_entities USING btree (html_variant_id);

CREATE INDEX idx_canvas_workspaces_website_id ON public.canvas_workspaces USING btree (website_id);

CREATE INDEX idx_collaborators_created_by ON public.collaborators USING btree (created_by);

CREATE INDEX idx_collaborators_website_id ON public.collaborators USING btree (website_id);

CREATE INDEX idx_domains_created_by ON public.domains USING btree (created_by);

CREATE INDEX idx_domains_domain ON public.domains USING btree (domain);

CREATE INDEX idx_invites_email ON public.invites USING btree (email);

CREATE INDEX idx_invites_website_id ON public.invites USING btree (website_id);

CREATE INDEX idx_routes_website_id ON public.routes USING btree (website_id);

CREATE INDEX idx_user_usage_created_by ON public.user_usage USING btree (created_by);

CREATE INDEX idx_website_variants_route_id ON public.website_variants USING btree (route_id);

CREATE INDEX idx_website_variants_website_id ON public.website_variants USING btree (website_id);

CREATE INDEX idx_websites_created_by ON public.websites USING btree (created_by);

CREATE UNIQUE INDEX invites_pkey ON public.invites USING btree (id);

CREATE UNIQUE INDEX invites_website_id_email_key ON public.invites USING btree (website_id, email);

CREATE UNIQUE INDEX plans_name_key ON public.plans USING btree (name);

CREATE UNIQUE INDEX plans_pkey ON public.plans USING btree (id);

CREATE UNIQUE INDEX routes_pkey ON public.routes USING btree (id);

CREATE UNIQUE INDEX routes_website_id_path_key ON public.routes USING btree (website_id, path);

CREATE UNIQUE INDEX user_subscriptions_created_by_key ON public.user_subscriptions USING btree (created_by);

CREATE UNIQUE INDEX user_subscriptions_pkey ON public.user_subscriptions USING btree (id);

CREATE UNIQUE INDEX user_usage_pkey ON public.user_usage USING btree (id);

CREATE UNIQUE INDEX website_variants_pkey ON public.website_variants USING btree (id);

CREATE UNIQUE INDEX websites_domain_key ON public.websites USING btree (domain);

CREATE UNIQUE INDEX websites_pkey ON public.websites USING btree (id);

alter table "public"."assets" add constraint "assets_pkey" PRIMARY KEY using index "assets_pkey";

alter table "public"."canvas_entities" add constraint "canvas_entities_pkey" PRIMARY KEY using index "canvas_entities_pkey";

alter table "public"."canvas_workspaces" add constraint "canvas_workspaces_pkey" PRIMARY KEY using index "canvas_workspaces_pkey";

alter table "public"."collaborators" add constraint "collaborators_pkey" PRIMARY KEY using index "collaborators_pkey";

alter table "public"."domains" add constraint "domains_pkey" PRIMARY KEY using index "domains_pkey";

alter table "public"."invites" add constraint "invites_pkey" PRIMARY KEY using index "invites_pkey";

alter table "public"."plans" add constraint "plans_pkey" PRIMARY KEY using index "plans_pkey";

alter table "public"."routes" add constraint "routes_pkey" PRIMARY KEY using index "routes_pkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_pkey" PRIMARY KEY using index "user_subscriptions_pkey";

alter table "public"."user_usage" add constraint "user_usage_pkey" PRIMARY KEY using index "user_usage_pkey";

alter table "public"."website_variants" add constraint "website_variants_pkey" PRIMARY KEY using index "website_variants_pkey";

alter table "public"."websites" add constraint "websites_pkey" PRIMARY KEY using index "websites_pkey";

alter table "public"."assets" add constraint "assets_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."assets" validate constraint "assets_created_by_fkey";

alter table "public"."assets" add constraint "assets_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL not valid;

alter table "public"."assets" validate constraint "assets_website_id_fkey";

alter table "public"."canvas_entities" add constraint "canvas_entities_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."canvas_entities" validate constraint "canvas_entities_created_by_fkey";

alter table "public"."canvas_entities" add constraint "canvas_entities_html_variant_id_fkey" FOREIGN KEY (html_variant_id) REFERENCES website_variants(id) ON DELETE SET NULL not valid;

alter table "public"."canvas_entities" validate constraint "canvas_entities_html_variant_id_fkey";

alter table "public"."canvas_workspaces" add constraint "canvas_workspaces_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."canvas_workspaces" validate constraint "canvas_workspaces_created_by_fkey";

alter table "public"."canvas_workspaces" add constraint "canvas_workspaces_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."canvas_workspaces" validate constraint "canvas_workspaces_updated_by_fkey";

alter table "public"."canvas_workspaces" add constraint "canvas_workspaces_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE not valid;

alter table "public"."canvas_workspaces" validate constraint "canvas_workspaces_website_id_fkey";

alter table "public"."collaborators" add constraint "collaborators_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."collaborators" validate constraint "collaborators_created_by_fkey";

alter table "public"."collaborators" add constraint "collaborators_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) not valid;

alter table "public"."collaborators" validate constraint "collaborators_invited_by_fkey";

alter table "public"."collaborators" add constraint "collaborators_role_check" CHECK ((role = ANY (ARRAY['viewer'::text, 'editor'::text, 'owner'::text]))) not valid;

alter table "public"."collaborators" validate constraint "collaborators_role_check";

alter table "public"."collaborators" add constraint "collaborators_status_check" CHECK ((status = ANY (ARRAY['invited'::text, 'accepted'::text, 'declined'::text]))) not valid;

alter table "public"."collaborators" validate constraint "collaborators_status_check";

alter table "public"."collaborators" add constraint "collaborators_website_id_created_by_key" UNIQUE using index "collaborators_website_id_created_by_key";

alter table "public"."collaborators" add constraint "collaborators_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE not valid;

alter table "public"."collaborators" validate constraint "collaborators_website_id_fkey";

alter table "public"."domains" add constraint "domains_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."domains" validate constraint "domains_created_by_fkey";

alter table "public"."domains" add constraint "domains_domain_key" UNIQUE using index "domains_domain_key";

alter table "public"."domains" add constraint "domains_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE not valid;

alter table "public"."domains" validate constraint "domains_website_id_fkey";

alter table "public"."invites" add constraint "invites_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."invites" validate constraint "invites_created_by_fkey";

alter table "public"."invites" add constraint "invites_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text]))) not valid;

alter table "public"."invites" validate constraint "invites_status_check";

alter table "public"."invites" add constraint "invites_website_id_email_key" UNIQUE using index "invites_website_id_email_key";

alter table "public"."invites" add constraint "invites_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE not valid;

alter table "public"."invites" validate constraint "invites_website_id_fkey";

alter table "public"."plans" add constraint "plans_name_key" UNIQUE using index "plans_name_key";

alter table "public"."routes" add constraint "fk_routes_published_variant_id" FOREIGN KEY (published_variant_id) REFERENCES website_variants(id) ON DELETE SET NULL not valid;

alter table "public"."routes" validate constraint "fk_routes_published_variant_id";

alter table "public"."routes" add constraint "routes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."routes" validate constraint "routes_created_by_fkey";

alter table "public"."routes" add constraint "routes_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."routes" validate constraint "routes_updated_by_fkey";

alter table "public"."routes" add constraint "routes_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE not valid;

alter table "public"."routes" validate constraint "routes_website_id_fkey";

alter table "public"."routes" add constraint "routes_website_id_path_key" UNIQUE using index "routes_website_id_path_key";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_created_by_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_created_by_key" UNIQUE using index "user_subscriptions_created_by_key";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES plans(id) not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_plan_id_fkey";

alter table "public"."user_usage" add constraint "user_usage_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_usage" validate constraint "user_usage_created_by_fkey";

alter table "public"."website_variants" add constraint "html_path_format" CHECK ((html_path ~~ 'website_pages/%'::text)) not valid;

alter table "public"."website_variants" validate constraint "html_path_format";

alter table "public"."website_variants" add constraint "website_variants_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."website_variants" validate constraint "website_variants_created_by_fkey";

alter table "public"."website_variants" add constraint "website_variants_route_id_fkey" FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE not valid;

alter table "public"."website_variants" validate constraint "website_variants_route_id_fkey";

alter table "public"."website_variants" add constraint "website_variants_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."website_variants" validate constraint "website_variants_updated_by_fkey";

alter table "public"."website_variants" add constraint "website_variants_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE not valid;

alter table "public"."website_variants" validate constraint "website_variants_website_id_fkey";

alter table "public"."websites" add constraint "websites_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."websites" validate constraint "websites_created_by_fkey";

alter table "public"."websites" add constraint "websites_domain_key" UNIQUE using index "websites_domain_key";

alter table "public"."websites" add constraint "websites_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."websites" validate constraint "websites_updated_by_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.reset_daily_usage()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  update public.user_usage
  set daily_llm_requests = 0, updated_at = now()
  where daily_llm_requests > 0;
end;
$function$
;

grant delete on table "public"."assets" to "anon";

grant insert on table "public"."assets" to "anon";

grant references on table "public"."assets" to "anon";

grant select on table "public"."assets" to "anon";

grant trigger on table "public"."assets" to "anon";

grant truncate on table "public"."assets" to "anon";

grant update on table "public"."assets" to "anon";

grant delete on table "public"."assets" to "authenticated";

grant insert on table "public"."assets" to "authenticated";

grant references on table "public"."assets" to "authenticated";

grant select on table "public"."assets" to "authenticated";

grant trigger on table "public"."assets" to "authenticated";

grant truncate on table "public"."assets" to "authenticated";

grant update on table "public"."assets" to "authenticated";

grant delete on table "public"."assets" to "service_role";

grant insert on table "public"."assets" to "service_role";

grant references on table "public"."assets" to "service_role";

grant select on table "public"."assets" to "service_role";

grant trigger on table "public"."assets" to "service_role";

grant truncate on table "public"."assets" to "service_role";

grant update on table "public"."assets" to "service_role";

grant delete on table "public"."canvas_entities" to "anon";

grant insert on table "public"."canvas_entities" to "anon";

grant references on table "public"."canvas_entities" to "anon";

grant select on table "public"."canvas_entities" to "anon";

grant trigger on table "public"."canvas_entities" to "anon";

grant truncate on table "public"."canvas_entities" to "anon";

grant update on table "public"."canvas_entities" to "anon";

grant delete on table "public"."canvas_entities" to "authenticated";

grant insert on table "public"."canvas_entities" to "authenticated";

grant references on table "public"."canvas_entities" to "authenticated";

grant select on table "public"."canvas_entities" to "authenticated";

grant trigger on table "public"."canvas_entities" to "authenticated";

grant truncate on table "public"."canvas_entities" to "authenticated";

grant update on table "public"."canvas_entities" to "authenticated";

grant delete on table "public"."canvas_entities" to "service_role";

grant insert on table "public"."canvas_entities" to "service_role";

grant references on table "public"."canvas_entities" to "service_role";

grant select on table "public"."canvas_entities" to "service_role";

grant trigger on table "public"."canvas_entities" to "service_role";

grant truncate on table "public"."canvas_entities" to "service_role";

grant update on table "public"."canvas_entities" to "service_role";

grant delete on table "public"."canvas_workspaces" to "anon";

grant insert on table "public"."canvas_workspaces" to "anon";

grant references on table "public"."canvas_workspaces" to "anon";

grant select on table "public"."canvas_workspaces" to "anon";

grant trigger on table "public"."canvas_workspaces" to "anon";

grant truncate on table "public"."canvas_workspaces" to "anon";

grant update on table "public"."canvas_workspaces" to "anon";

grant delete on table "public"."canvas_workspaces" to "authenticated";

grant insert on table "public"."canvas_workspaces" to "authenticated";

grant references on table "public"."canvas_workspaces" to "authenticated";

grant select on table "public"."canvas_workspaces" to "authenticated";

grant trigger on table "public"."canvas_workspaces" to "authenticated";

grant truncate on table "public"."canvas_workspaces" to "authenticated";

grant update on table "public"."canvas_workspaces" to "authenticated";

grant delete on table "public"."canvas_workspaces" to "service_role";

grant insert on table "public"."canvas_workspaces" to "service_role";

grant references on table "public"."canvas_workspaces" to "service_role";

grant select on table "public"."canvas_workspaces" to "service_role";

grant trigger on table "public"."canvas_workspaces" to "service_role";

grant truncate on table "public"."canvas_workspaces" to "service_role";

grant update on table "public"."canvas_workspaces" to "service_role";

grant delete on table "public"."collaborators" to "anon";

grant insert on table "public"."collaborators" to "anon";

grant references on table "public"."collaborators" to "anon";

grant select on table "public"."collaborators" to "anon";

grant trigger on table "public"."collaborators" to "anon";

grant truncate on table "public"."collaborators" to "anon";

grant update on table "public"."collaborators" to "anon";

grant delete on table "public"."collaborators" to "authenticated";

grant insert on table "public"."collaborators" to "authenticated";

grant references on table "public"."collaborators" to "authenticated";

grant select on table "public"."collaborators" to "authenticated";

grant trigger on table "public"."collaborators" to "authenticated";

grant truncate on table "public"."collaborators" to "authenticated";

grant update on table "public"."collaborators" to "authenticated";

grant delete on table "public"."collaborators" to "service_role";

grant insert on table "public"."collaborators" to "service_role";

grant references on table "public"."collaborators" to "service_role";

grant select on table "public"."collaborators" to "service_role";

grant trigger on table "public"."collaborators" to "service_role";

grant truncate on table "public"."collaborators" to "service_role";

grant update on table "public"."collaborators" to "service_role";

grant delete on table "public"."domains" to "anon";

grant insert on table "public"."domains" to "anon";

grant references on table "public"."domains" to "anon";

grant select on table "public"."domains" to "anon";

grant trigger on table "public"."domains" to "anon";

grant truncate on table "public"."domains" to "anon";

grant update on table "public"."domains" to "anon";

grant delete on table "public"."domains" to "authenticated";

grant insert on table "public"."domains" to "authenticated";

grant references on table "public"."domains" to "authenticated";

grant select on table "public"."domains" to "authenticated";

grant trigger on table "public"."domains" to "authenticated";

grant truncate on table "public"."domains" to "authenticated";

grant update on table "public"."domains" to "authenticated";

grant delete on table "public"."domains" to "service_role";

grant insert on table "public"."domains" to "service_role";

grant references on table "public"."domains" to "service_role";

grant select on table "public"."domains" to "service_role";

grant trigger on table "public"."domains" to "service_role";

grant truncate on table "public"."domains" to "service_role";

grant update on table "public"."domains" to "service_role";

grant delete on table "public"."invites" to "anon";

grant insert on table "public"."invites" to "anon";

grant references on table "public"."invites" to "anon";

grant select on table "public"."invites" to "anon";

grant trigger on table "public"."invites" to "anon";

grant truncate on table "public"."invites" to "anon";

grant update on table "public"."invites" to "anon";

grant delete on table "public"."invites" to "authenticated";

grant insert on table "public"."invites" to "authenticated";

grant references on table "public"."invites" to "authenticated";

grant select on table "public"."invites" to "authenticated";

grant trigger on table "public"."invites" to "authenticated";

grant truncate on table "public"."invites" to "authenticated";

grant update on table "public"."invites" to "authenticated";

grant delete on table "public"."invites" to "service_role";

grant insert on table "public"."invites" to "service_role";

grant references on table "public"."invites" to "service_role";

grant select on table "public"."invites" to "service_role";

grant trigger on table "public"."invites" to "service_role";

grant truncate on table "public"."invites" to "service_role";

grant update on table "public"."invites" to "service_role";

grant delete on table "public"."plans" to "anon";

grant insert on table "public"."plans" to "anon";

grant references on table "public"."plans" to "anon";

grant select on table "public"."plans" to "anon";

grant trigger on table "public"."plans" to "anon";

grant truncate on table "public"."plans" to "anon";

grant update on table "public"."plans" to "anon";

grant delete on table "public"."plans" to "authenticated";

grant insert on table "public"."plans" to "authenticated";

grant references on table "public"."plans" to "authenticated";

grant select on table "public"."plans" to "authenticated";

grant trigger on table "public"."plans" to "authenticated";

grant truncate on table "public"."plans" to "authenticated";

grant update on table "public"."plans" to "authenticated";

grant delete on table "public"."plans" to "service_role";

grant insert on table "public"."plans" to "service_role";

grant references on table "public"."plans" to "service_role";

grant select on table "public"."plans" to "service_role";

grant trigger on table "public"."plans" to "service_role";

grant truncate on table "public"."plans" to "service_role";

grant update on table "public"."plans" to "service_role";

grant delete on table "public"."routes" to "anon";

grant insert on table "public"."routes" to "anon";

grant references on table "public"."routes" to "anon";

grant select on table "public"."routes" to "anon";

grant trigger on table "public"."routes" to "anon";

grant truncate on table "public"."routes" to "anon";

grant update on table "public"."routes" to "anon";

grant delete on table "public"."routes" to "authenticated";

grant insert on table "public"."routes" to "authenticated";

grant references on table "public"."routes" to "authenticated";

grant select on table "public"."routes" to "authenticated";

grant trigger on table "public"."routes" to "authenticated";

grant truncate on table "public"."routes" to "authenticated";

grant update on table "public"."routes" to "authenticated";

grant delete on table "public"."routes" to "service_role";

grant insert on table "public"."routes" to "service_role";

grant references on table "public"."routes" to "service_role";

grant select on table "public"."routes" to "service_role";

grant trigger on table "public"."routes" to "service_role";

grant truncate on table "public"."routes" to "service_role";

grant update on table "public"."routes" to "service_role";

grant delete on table "public"."user_subscriptions" to "anon";

grant insert on table "public"."user_subscriptions" to "anon";

grant references on table "public"."user_subscriptions" to "anon";

grant select on table "public"."user_subscriptions" to "anon";

grant trigger on table "public"."user_subscriptions" to "anon";

grant truncate on table "public"."user_subscriptions" to "anon";

grant update on table "public"."user_subscriptions" to "anon";

grant delete on table "public"."user_subscriptions" to "authenticated";

grant insert on table "public"."user_subscriptions" to "authenticated";

grant references on table "public"."user_subscriptions" to "authenticated";

grant select on table "public"."user_subscriptions" to "authenticated";

grant trigger on table "public"."user_subscriptions" to "authenticated";

grant truncate on table "public"."user_subscriptions" to "authenticated";

grant update on table "public"."user_subscriptions" to "authenticated";

grant delete on table "public"."user_subscriptions" to "service_role";

grant insert on table "public"."user_subscriptions" to "service_role";

grant references on table "public"."user_subscriptions" to "service_role";

grant select on table "public"."user_subscriptions" to "service_role";

grant trigger on table "public"."user_subscriptions" to "service_role";

grant truncate on table "public"."user_subscriptions" to "service_role";

grant update on table "public"."user_subscriptions" to "service_role";

grant delete on table "public"."user_usage" to "anon";

grant insert on table "public"."user_usage" to "anon";

grant references on table "public"."user_usage" to "anon";

grant select on table "public"."user_usage" to "anon";

grant trigger on table "public"."user_usage" to "anon";

grant truncate on table "public"."user_usage" to "anon";

grant update on table "public"."user_usage" to "anon";

grant delete on table "public"."user_usage" to "authenticated";

grant insert on table "public"."user_usage" to "authenticated";

grant references on table "public"."user_usage" to "authenticated";

grant select on table "public"."user_usage" to "authenticated";

grant trigger on table "public"."user_usage" to "authenticated";

grant truncate on table "public"."user_usage" to "authenticated";

grant update on table "public"."user_usage" to "authenticated";

grant delete on table "public"."user_usage" to "service_role";

grant insert on table "public"."user_usage" to "service_role";

grant references on table "public"."user_usage" to "service_role";

grant select on table "public"."user_usage" to "service_role";

grant trigger on table "public"."user_usage" to "service_role";

grant truncate on table "public"."user_usage" to "service_role";

grant update on table "public"."user_usage" to "service_role";

grant delete on table "public"."website_variants" to "anon";

grant insert on table "public"."website_variants" to "anon";

grant references on table "public"."website_variants" to "anon";

grant select on table "public"."website_variants" to "anon";

grant trigger on table "public"."website_variants" to "anon";

grant truncate on table "public"."website_variants" to "anon";

grant update on table "public"."website_variants" to "anon";

grant delete on table "public"."website_variants" to "authenticated";

grant insert on table "public"."website_variants" to "authenticated";

grant references on table "public"."website_variants" to "authenticated";

grant select on table "public"."website_variants" to "authenticated";

grant trigger on table "public"."website_variants" to "authenticated";

grant truncate on table "public"."website_variants" to "authenticated";

grant update on table "public"."website_variants" to "authenticated";

grant delete on table "public"."website_variants" to "service_role";

grant insert on table "public"."website_variants" to "service_role";

grant references on table "public"."website_variants" to "service_role";

grant select on table "public"."website_variants" to "service_role";

grant trigger on table "public"."website_variants" to "service_role";

grant truncate on table "public"."website_variants" to "service_role";

grant update on table "public"."website_variants" to "service_role";

grant delete on table "public"."websites" to "anon";

grant insert on table "public"."websites" to "anon";

grant references on table "public"."websites" to "anon";

grant select on table "public"."websites" to "anon";

grant trigger on table "public"."websites" to "anon";

grant truncate on table "public"."websites" to "anon";

grant update on table "public"."websites" to "anon";

grant delete on table "public"."websites" to "authenticated";

grant insert on table "public"."websites" to "authenticated";

grant references on table "public"."websites" to "authenticated";

grant select on table "public"."websites" to "authenticated";

grant trigger on table "public"."websites" to "authenticated";

grant truncate on table "public"."websites" to "authenticated";

grant update on table "public"."websites" to "authenticated";

grant delete on table "public"."websites" to "service_role";

grant insert on table "public"."websites" to "service_role";

grant references on table "public"."websites" to "service_role";

grant select on table "public"."websites" to "service_role";

grant trigger on table "public"."websites" to "service_role";

grant truncate on table "public"."websites" to "service_role";

grant update on table "public"."websites" to "service_role";

create policy "Users can manage their own assets"
on "public"."assets"
as permissive
for all
to public
using ((auth.uid() = created_by));


create policy "Users can manage their own canvas entities"
on "public"."canvas_entities"
as permissive
for all
to public
using ((created_by = auth.uid()));


create policy "Users can view canvas entities"
on "public"."canvas_entities"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM collaborators
  WHERE ((collaborators.website_id = ( SELECT website_variants.website_id
           FROM website_variants
          WHERE (website_variants.id = canvas_entities.html_variant_id))) AND (collaborators.created_by = auth.uid())))));


create policy "Editors and owners can manage canvas workspaces"
on "public"."canvas_workspaces"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM collaborators
  WHERE ((collaborators.website_id = canvas_workspaces.website_id) AND (collaborators.created_by = auth.uid()) AND (collaborators.role = ANY (ARRAY['editor'::text, 'owner'::text]))))));


create policy "Users can view canvas workspaces"
on "public"."canvas_workspaces"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM collaborators
  WHERE ((collaborators.website_id = canvas_workspaces.website_id) AND (collaborators.created_by = auth.uid())))));


create policy "Owners can manage collaborators"
on "public"."collaborators"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM collaborators c
  WHERE ((c.website_id = collaborators.website_id) AND (c.created_by = auth.uid()) AND (c.role = 'owner'::text)))));


create policy "Users can view collaborators"
on "public"."collaborators"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM collaborators c
  WHERE ((c.website_id = collaborators.website_id) AND (c.created_by = auth.uid())))));


create policy "Users can manage their own domains"
on "public"."domains"
as permissive
for all
to public
using ((auth.uid() = created_by));


create policy "Users can manage their own invites"
on "public"."invites"
as permissive
for all
to public
using ((auth.uid() = created_by));


create policy "Public can read routes"
on "public"."routes"
as permissive
for select
to public
using (true);


create policy "Users can manage their own routes"
on "public"."routes"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM websites
  WHERE ((websites.id = routes.website_id) AND (websites.created_by = auth.uid())))));


create policy "Users can view and manage their subscriptions"
on "public"."user_subscriptions"
as permissive
for all
to public
using ((auth.uid() = created_by));


create policy "System can update usage"
on "public"."user_usage"
as permissive
for update
to public
using ((auth.role() = 'service_role'::text));


create policy "Users can view their usage"
on "public"."user_usage"
as permissive
for select
to public
using ((auth.uid() = created_by));


create policy "Editors and owners can manage website variants"
on "public"."website_variants"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM collaborators
  WHERE ((collaborators.website_id = website_variants.website_id) AND (collaborators.created_by = auth.uid()) AND (collaborators.role = ANY (ARRAY['editor'::text, 'owner'::text]))))));


create policy "Users can view website variants"
on "public"."website_variants"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM collaborators
  WHERE ((collaborators.website_id = website_variants.website_id) AND (collaborators.created_by = auth.uid())))));


create policy "Users can manage their own websites"
on "public"."websites"
as permissive
for all
to public
using ((auth.uid() = created_by));



