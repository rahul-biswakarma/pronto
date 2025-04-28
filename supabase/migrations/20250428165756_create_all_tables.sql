create table "public"."assets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "website_id" uuid,
    "file_path" text not null,
    "file_size" integer not null,
    "file_type" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."assets" enable row level security;

create table "public"."domains" (
    "id" uuid not null default gen_random_uuid(),
    "domain" text not null,
    "user_id" uuid not null,
    "website_id" uuid not null,
    "is_custom" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."domains" enable row level security;

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
    "html_file_path" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."routes" enable row level security;

create table "public"."user_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "plan_id" uuid not null,
    "subscribed_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone
);


alter table "public"."user_subscriptions" enable row level security;

create table "public"."user_usage" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "daily_llm_requests" integer default 0,
    "total_llm_requests" integer default 0,
    "asset_storage_used_mb" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_usage" enable row level security;

create table "public"."websites" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "is_published" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "is_first_visit" boolean default true
);


alter table "public"."websites" enable row level security;

CREATE UNIQUE INDEX assets_pkey ON public.assets USING btree (id);

CREATE UNIQUE INDEX domains_domain_key ON public.domains USING btree (domain);

CREATE UNIQUE INDEX domains_pkey ON public.domains USING btree (id);

CREATE INDEX idx_assets_user_id ON public.assets USING btree (user_id);

CREATE INDEX idx_assets_website_id ON public.assets USING btree (website_id);

CREATE INDEX idx_domains_domain ON public.domains USING btree (domain);

CREATE INDEX idx_domains_user_id ON public.domains USING btree (user_id);

CREATE INDEX idx_routes_website_id ON public.routes USING btree (website_id);

CREATE INDEX idx_user_usage_user_id ON public.user_usage USING btree (user_id);

CREATE INDEX idx_websites_user_id ON public.websites USING btree (user_id);

CREATE UNIQUE INDEX plans_name_key ON public.plans USING btree (name);

CREATE UNIQUE INDEX plans_pkey ON public.plans USING btree (id);

CREATE UNIQUE INDEX routes_pkey ON public.routes USING btree (id);

CREATE UNIQUE INDEX routes_website_id_path_key ON public.routes USING btree (website_id, path);

CREATE UNIQUE INDEX user_subscriptions_pkey ON public.user_subscriptions USING btree (id);

CREATE UNIQUE INDEX user_subscriptions_user_id_key ON public.user_subscriptions USING btree (user_id);

CREATE UNIQUE INDEX user_usage_pkey ON public.user_usage USING btree (id);

CREATE UNIQUE INDEX websites_pkey ON public.websites USING btree (id);

alter table "public"."assets" add constraint "assets_pkey" PRIMARY KEY using index "assets_pkey";

alter table "public"."domains" add constraint "domains_pkey" PRIMARY KEY using index "domains_pkey";

alter table "public"."plans" add constraint "plans_pkey" PRIMARY KEY using index "plans_pkey";

alter table "public"."routes" add constraint "routes_pkey" PRIMARY KEY using index "routes_pkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_pkey" PRIMARY KEY using index "user_subscriptions_pkey";

alter table "public"."user_usage" add constraint "user_usage_pkey" PRIMARY KEY using index "user_usage_pkey";

alter table "public"."websites" add constraint "websites_pkey" PRIMARY KEY using index "websites_pkey";

alter table "public"."assets" add constraint "assets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."assets" validate constraint "assets_user_id_fkey";

alter table "public"."assets" add constraint "assets_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL not valid;

alter table "public"."assets" validate constraint "assets_website_id_fkey";

alter table "public"."domains" add constraint "domains_domain_key" UNIQUE using index "domains_domain_key";

alter table "public"."domains" add constraint "domains_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."domains" validate constraint "domains_user_id_fkey";

alter table "public"."domains" add constraint "domains_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE not valid;

alter table "public"."domains" validate constraint "domains_website_id_fkey";

alter table "public"."plans" add constraint "plans_name_key" UNIQUE using index "plans_name_key";

alter table "public"."routes" add constraint "routes_website_id_fkey" FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE not valid;

alter table "public"."routes" validate constraint "routes_website_id_fkey";

alter table "public"."routes" add constraint "routes_website_id_path_key" UNIQUE using index "routes_website_id_path_key";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES plans(id) not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_plan_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_user_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_key" UNIQUE using index "user_subscriptions_user_id_key";

alter table "public"."user_usage" add constraint "user_usage_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_usage" validate constraint "user_usage_user_id_fkey";

alter table "public"."websites" add constraint "websites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."websites" validate constraint "websites_user_id_fkey";

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
using ((auth.uid() = user_id));


create policy "Users can manage their own domains"
on "public"."domains"
as permissive
for all
to public
using ((auth.uid() = user_id));


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
  WHERE ((websites.id = routes.website_id) AND (websites.user_id = auth.uid())))));


create policy "Users can view and manage their subscriptions"
on "public"."user_subscriptions"
as permissive
for all
to public
using ((auth.uid() = user_id));


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
using ((auth.uid() = user_id));


create policy "Users can manage their own websites"
on "public"."websites"
as permissive
for all
to public
using ((auth.uid() = user_id));



