import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { getBlog, listBlogSlugs } from "@/lib/blogs";

const BG = "#F8F7F2";
const BODY = "#2D2A26";
const HEADER = "#556B4F";

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
      className="min-h-screen font-(family-name:--font-inter)"
      style={{ backgroundColor: BG, color: BODY }}
    >
      <div className="max-w-3xl mx-auto px-8 py-16">
        <a
          href="/#blogs"
          className="inline-block text-sm font-mono mb-12 transition-colors"
          style={{ color: `${BODY}B3` }}
        >
          ← Home
        </a>

        <h1
          className="text-4xl md:text-5xl font-(family-name:--font-fraunces) font-bold leading-tight mb-4"
          style={{ color: HEADER }}
        >
          {blog.title}
        </h1>
        <p
          className="text-sm font-mono mb-12"
          style={{ color: `${BODY}B3` }}
        >
          {blog.date && <span>{blog.date}</span>}
          {blog.date && <span> · </span>}
          <span>Tao Sun</span>
        </p>

        <hr className="mb-12" style={{ borderColor: `${BODY}33` }} />

        <article>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: (props) => (
                <h1
                  className="font-(family-name:--font-fraunces) font-bold text-3xl mt-12 mb-4 first:mt-0"
                  style={{ color: HEADER }}
                  {...props}
                />
              ),
              h2: (props) => (
                <h2
                  className="font-(family-name:--font-fraunces) font-bold text-2xl mt-10 mb-3 first:mt-0"
                  style={{ color: HEADER }}
                  {...props}
                />
              ),
              h3: (props) => (
                <h3
                  className="font-(family-name:--font-fraunces) font-semibold text-xl mt-8 mb-3 first:mt-0"
                  style={{ color: HEADER }}
                  {...props}
                />
              ),
              p: (props) => (
                <p
                  className="text-base leading-relaxed mb-5"
                  style={{ color: BODY }}
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
                  className="text-base leading-relaxed"
                  style={{ color: BODY }}
                  {...props}
                />
              ),
              blockquote: (props) => (
                <blockquote
                  className="pl-4 italic my-5 border-l-2"
                  style={{ color: `${BODY}CC`, borderColor: `${BODY}80` }}
                  {...props}
                />
              ),
              pre: (props) => (
                <pre
                  className="font-mono text-sm p-4 mb-5 overflow-x-auto"
                  style={{ backgroundColor: `${BODY}14`, color: BODY }}
                  {...props}
                />
              ),
              code: (props) => (
                <code
                  className="font-mono text-sm px-1 py-0.5"
                  style={{ backgroundColor: `${BODY}14`, color: BODY }}
                  {...props}
                />
              ),
              a: (props) => (
                <a
                  className="underline"
                  style={{ color: HEADER, textDecorationColor: `${HEADER}99` }}
                  {...props}
                />
              ),
              strong: (props) => (
                <strong
                  className="font-semibold"
                  style={{ color: BODY }}
                  {...props}
                />
              ),
              em: (props) => <em className="italic" {...props} />,
              hr: (props) => (
                <hr className="my-8" style={{ borderColor: `${BODY}33` }} {...props} />
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
