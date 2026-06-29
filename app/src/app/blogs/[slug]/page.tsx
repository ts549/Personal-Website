import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlog, listBlogSlugs } from "@/lib/blogs";

export async function generateStaticParams() {
  const slugs = await listBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  return (
    <main
      className="min-h-screen text-[#dedcd0]"
      style={{ backgroundColor: "#a1ae90" }}
    >
      <div className="max-w-3xl mx-auto px-8 py-16">
        <a
          href="/#blogs"
          className="inline-block text-sm font-mono text-[#dedcd0]/70 hover:text-[#dedcd0] transition-colors mb-12"
        >
          ← Home
        </a>

        <p className="text-xs font-mono tracking-widest uppercase text-[#dedcd0]/70 mb-4">
          {[blog.year, blog.month].filter(Boolean).join(" · ")}
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
          {blog.title}
        </h1>
        {blog.summary && (
          <p className="text-lg text-[#dedcd0]/85 leading-relaxed mb-12 max-w-2xl">
            {blog.summary}
          </p>
        )}

        <hr className="border-[#dedcd0]/30 mb-12" />

        <article>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: (props) => (
                <h1
                  className="font-serif font-bold text-3xl text-[#dedcd0] mt-12 mb-4 first:mt-0"
                  {...props}
                />
              ),
              h2: (props) => (
                <h2
                  className="font-serif font-bold text-2xl text-[#dedcd0] mt-10 mb-3 first:mt-0"
                  {...props}
                />
              ),
              h3: (props) => (
                <h3
                  className="font-serif font-semibold text-xl text-[#dedcd0] mt-8 mb-3 first:mt-0"
                  {...props}
                />
              ),
              p: (props) => (
                <p
                  className="text-base text-[#dedcd0]/90 leading-relaxed mb-5"
                  {...props}
                />
              ),
              ul: (props) => (
                <ul className="list-disc pl-6 mb-5 space-y-2" {...props} />
              ),
              ol: (props) => (
                <ol className="list-decimal pl-6 mb-5 space-y-2" {...props} />
              ),
              li: (props) => (
                <li
                  className="text-base text-[#dedcd0]/90 leading-relaxed"
                  {...props}
                />
              ),
              blockquote: (props) => (
                <blockquote
                  className="border-l-2 border-[#dedcd0]/50 pl-4 italic text-[#dedcd0]/80 my-5"
                  {...props}
                />
              ),
              pre: (props) => (
                <pre
                  className="font-mono text-sm bg-[#dedcd0]/10 p-4 mb-5 overflow-x-auto text-[#dedcd0]/95"
                  {...props}
                />
              ),
              code: (props) => (
                <code
                  className="font-mono text-sm bg-[#dedcd0]/10 px-1 py-0.5 text-[#dedcd0]"
                  {...props}
                />
              ),
              a: (props) => (
                <a
                  className="text-[#dedcd0] underline decoration-[#dedcd0]/60 hover:decoration-[#dedcd0]"
                  {...props}
                />
              ),
              strong: (props) => (
                <strong className="font-semibold text-[#dedcd0]" {...props} />
              ),
              em: (props) => <em className="italic" {...props} />,
              hr: (props) => (
                <hr className="border-[#dedcd0]/30 my-8" {...props} />
              ),
            }}
          >
            {blog.body}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
