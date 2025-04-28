alter table "public"."routes" add constraint "html_file_path_format" CHECK (((html_file_path ~~ 'website_pages/%'::text) OR (html_file_path ~~ 'portfolios/%'::text))) not valid;

alter table "public"."routes" validate constraint "html_file_path_format";


