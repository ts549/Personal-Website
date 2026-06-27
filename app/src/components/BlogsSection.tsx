const posts = [
  {
    id: 1,
    title: 'Building Scalable APIs with Next.js and TypeScript',
    date: 'June 10, 2026',
    excerpt:
      'In this post, I explore patterns for building type-safe, performant REST and GraphQL APIs using the Next.js App Router, tRPC, and Zod for runtime validation.',
    readTime: '6 min read',
    tag: 'Engineering',
  },
  {
    id: 2,
    title: 'Designing for Accessibility: Lessons from the Trenches',
    date: 'May 22, 2026',
    excerpt:
      'Accessibility is not an afterthought. After auditing three production apps, here are the most common pitfalls and how to fix them without sacrificing aesthetics.',
    readTime: '8 min read',
    tag: 'Design',
  },
  {
    id: 3,
    title: 'From Idea to Deploy: My Side-Project Workflow in 2026',
    date: 'April 5, 2026',
    excerpt:
      'A behind-the-scenes look at how I plan, prototype, and ship personal projects quickly — including the tools, templates, and mental models that keep me productive.',
    readTime: '5 min read',
    tag: 'Productivity',
  },
];

const tagColors: Record<string, string> = {
  Engineering: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Design: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Productivity: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export default function BlogsSection() {
  return (
    <section id="blog" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Blog</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-sm">Thoughts on engineering, design, and building things</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    tagColors[post.tag] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {post.tag}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{post.readTime}</span>
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1">
                {post.excerpt}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <time className="text-xs text-gray-400 dark:text-gray-500">{post.date}</time>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline cursor-pointer">
                  Read more →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
