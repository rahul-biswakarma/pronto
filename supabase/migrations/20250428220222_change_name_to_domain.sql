alter table "public"."websites" drop column "name";

alter table "public"."websites" add column "domain" text not null;

CREATE UNIQUE INDEX websites_domain_key ON public.websites USING btree (domain);

alter table "public"."websites" add constraint "websites_domain_key" UNIQUE using index "websites_domain_key";


