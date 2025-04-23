import { Editor } from "@/libs/components/editor/editor";
import { EditorProvider } from "@/libs/components/editor/editor.context";
import { checkAuthentication } from "@/libs/utils/auth";
import { getFileFromBucket } from "@/libs/utils/supabase-storage";
import { redirect } from "next/navigation";

export default async function Page() {
  const { authenticated, errorResponse, supabase, userId, user } =
    await checkAuthentication();

  if (!authenticated || errorResponse) {
    redirect("/");
  }

  const { data: portfolio, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("user_id", userId);

  if (
    error ||
    !portfolio ||
    portfolio.length === 0
    // if content is null, it means the user has not submitted their portfolio yet
  ) {
    redirect("/");
  }

  // TODO: Add portfolio selector in case the user has multiple portfolios
  const htmlContent = (await getFileFromBucket(portfolio[0].html_s3_path)).data;
  const cssVars: Record<string, string> = {};

  // Extract CSS variables from style tags
  const styleMatch = htmlContent?.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatch) {
    const varRegex = /--[\w-]+:\s*[^;]+/g;
    styleMatch.forEach((style) => {
      const vars = style.match(varRegex);
      if (vars) {
        vars.forEach((v) => {
          const [key, value] = v.split(":").map((s) => s.trim());
          cssVars[key] = value;
        });
      }
    });
  }

  const html = htmlContent;

  const dls: Record<string, any> = {
    theme: cssVars,
  };

  return (
    <EditorProvider
      user={user}
      html={html ?? ""}
      portfolio={portfolio[0]}
      dls={dls}
    >
      <Editor />
    </EditorProvider>
  );
}
