'use client'

import { Loader2 } from 'lucide-react'
import WorkspaceConnector from '@/components/WorkspaceConnector'
import { useAuth } from '@/hooks/useAuth'
import { getGoogleAuthUrl } from '@/lib/api'
import { mockData } from '@/lib/mockData'

async function initOAuthFlow(payload: { services: string[] }): Promise<string[] | void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return payload.services
  }
  window.location.href = getGoogleAuthUrl()
  await new Promise(() => {})
}

function toConnectorShape(sources: Record<string, boolean> | undefined) {
  return {
    googleDrive: sources?.drive ?? false,
    gmail: sources?.gmail ?? false,
    googleSheets: sources?.sheets ?? false,
    googleCalendar: sources?.calendar ?? false,
  }
}

export default function Workspace() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={20} className="animate-spin text-violet-400" />
      </div>
    )
  }

  const rawSources =
    process.env.NEXT_PUBLIC_USE_MOCK === 'true' ? mockData.connectedSources : user?.connectedSources

  return (
    <WorkspaceConnector
      initialConnected={toConnectorShape(rawSources)}
      onInitOAuth={initOAuthFlow}
    />
  )
}
