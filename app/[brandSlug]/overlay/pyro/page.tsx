import { notFound } from "next/navigation";
import { OverlayPyro } from "@/components/pages/overlay/pyro";
import { getBrandBySlug } from "@/lib/database/queries";

export default async function OverlayPyroPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  const { brandSlug } = await params;
  const brand = await getBrandBySlug(brandSlug);
  if (!brand) {
    return notFound();
  }

  return <OverlayPyro brand={brand} />;
}
