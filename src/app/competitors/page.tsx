import { AdGallery } from "@/components/ad-gallery";
import { PageHeader } from "@/components/ui";
import { getCompetitorAds, getWorkspace } from "@/lib/data";

export default async function CompetitorsPage({ searchParams }: PageProps<"/competitors">) {
  const { ws } = await searchParams;
  const workspace = await getWorkspace(typeof ws === "string" ? ws : undefined);
  if (!workspace) return null;
  const ads = await getCompetitorAds(workspace.id);

  return (
    <>
      <PageHeader
        title="Concurrenten"
        sub="Gescrapete ads, getagd door Jev. Winnaar-score = looptijd + varianten + kracht van de creative."
      />
      <AdGallery ads={ads} />
    </>
  );
}
