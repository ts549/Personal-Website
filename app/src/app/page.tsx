import { listBlogs } from "@/lib/blogs";
import { listExperiences } from "@/lib/experiences";
import { listProjects } from "@/lib/projects";
import { listSocialButtons } from "@/lib/social";
import HomeClient from "./HomeClient";

export default async function Home() {
  const [projects, blogs, experiences, socialButtons] = await Promise.all([
    listProjects(),
    listBlogs(),
    listExperiences(),
    listSocialButtons(),
  ]);
  return (
    <HomeClient
      projects={projects}
      blogs={blogs}
      experiences={experiences}
      socialButtons={socialButtons}
    />
  );
}
