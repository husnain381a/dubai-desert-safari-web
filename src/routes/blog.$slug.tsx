import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({ component: BlogPost });

function BlogPost() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<any>(null);
  useEffect(() => {
    supabase.from("blogs").select("*").eq("slug", slug).maybeSingle().then(({ data }) => setPost(data));
  }, [slug]);
  if (!post) return <SiteLayout><div className="pt-32 mx-auto max-w-3xl px-4 py-20">Loading…</div></SiteLayout>;
  return (
    <SiteLayout>
      <article className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="h-4 w-4" /> Back to blog</Link>
          <div className="mt-6 text-xs uppercase tracking-wider text-primary font-medium">{post.category}</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">{post.title}</h1>
          <p className="mt-3 text-muted-foreground">By {post.author} · {new Date(post.published_at).toLocaleDateString()}</p>
          {post.cover_image && <img src={post.cover_image} alt={post.title} className="mt-8 w-full rounded-2xl shadow-lg" />}
          <div className="mt-8 prose prose-lg max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">{post.content}</div>
        </div>
      </article>
    </SiteLayout>
  );
}
