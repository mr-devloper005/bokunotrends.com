import { TaskListPage } from "@/components/tasks/task-list-page";
import { buildTaskMetadata } from "@/lib/seo";
import { taskPageMetadata } from "@/config/site.content";

export const revalidate = 3;

export const generateMetadata = () =>
  buildTaskMetadata("classified", {
    title: taskPageMetadata.classified.title,
    description: taskPageMetadata.classified.description,
  });

export default async function ClassifiedsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; location?: string }> | { category?: string; location?: string }
}) {
  const params = await searchParams;
  return (
    <TaskListPage task="classified" category={params?.category} location={params?.location} />
  )
}
