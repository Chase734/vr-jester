import { ResidentWorkspace } from "@/components/resident-workspace";

export default async function ResidentPage({ params }: PageProps<"/residents/[id]">) {
  const { id } = await params;
  return <ResidentWorkspace residentId={id} />;
}
