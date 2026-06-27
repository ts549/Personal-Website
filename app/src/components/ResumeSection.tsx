export default function ResumeSection() {
  return (
    <section id="resume" className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Resume</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-sm">A snapshot of my experience and skills</p>

        {/* Name & Contact */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 mb-6">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Alex Johnson</h3>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-1">Full-Stack Developer &amp; Designer</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <span>📧 alex.johnson@example.com</span>
            <span>📱 (555) 123-4567</span>
            <span>🌐 alexjohnson.dev</span>
            <span>📍 San Francisco, CA</span>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 mb-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="inline-block w-1 h-5 rounded bg-indigo-500"></span>
            Experience
          </h4>
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-gray-800 dark:text-gray-100">Senior Software Engineer</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Jan 2023 – Present</span>
              </div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">Acme Corp · San Francisco, CA</p>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Led development of a microservices platform serving 2M+ users.</li>
                <li>Reduced API latency by 40% through caching and query optimization.</li>
                <li>Mentored a team of 4 junior engineers.</li>
              </ul>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-gray-800 dark:text-gray-100">Software Engineer</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Jun 2020 – Dec 2022</span>
              </div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">Startup XYZ · Remote</p>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Built React/Next.js front-end from scratch, increasing conversion by 25%.</li>
                <li>Integrated third-party payment and analytics APIs.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 mb-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="inline-block w-1 h-5 rounded bg-indigo-500"></span>
            Education
          </h4>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="font-semibold text-gray-800 dark:text-gray-100">B.S. Computer Science</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">2016 – 2020</span>
            </div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">University of California, Berkeley</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">GPA: 3.8 · Dean's List · Senior Capstone Award</p>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="inline-block w-1 h-5 rounded bg-indigo-500"></span>
            Skills
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'SQL'] },
              { category: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'FastAPI'] },
              { category: 'Infrastructure', items: ['AWS', 'Docker', 'Kubernetes', 'Terraform'] },
              { category: 'Design', items: ['Figma', 'Tailwind CSS', 'Framer', 'Storybook'] },
            ].map(({ category, items }) => (
              <div key={category}>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="inline-block px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
