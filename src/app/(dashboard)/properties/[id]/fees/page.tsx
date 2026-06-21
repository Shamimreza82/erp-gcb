import { FeesPage } from "@/modules/property-fees/components/fees-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FeesPage propertyId={id} />
}
