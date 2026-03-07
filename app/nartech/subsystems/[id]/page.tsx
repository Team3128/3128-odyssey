import SubsystemDisplayPage from "@/app/components/SubsystemDisplayPage"


interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <SubsystemDisplayPage id={id} />
}