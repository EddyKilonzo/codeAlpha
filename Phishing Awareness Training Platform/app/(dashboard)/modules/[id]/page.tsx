import { MODULES } from '@/data/modules'
import { notFound } from 'next/navigation'
import { ModulePageClient } from './ModulePageClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ModulePage({ params }: Props) {
  const { id } = await params
  const module = MODULES.find((m) => m.id === id)
  if (!module) notFound()
  return <ModulePageClient module={module} />
}

export async function generateStaticParams() {
  return MODULES.map((m) => ({ id: m.id }))
}
