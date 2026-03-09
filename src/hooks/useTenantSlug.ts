'use client'

import { useState, useEffect } from 'react'

interface TenantInfo {
  tenantSlug: string
  tenantId: string
  role: string
}

export function useTenantSlug(): { tenantSlug: string | null; loading: boolean } {
  const [info, setInfo] = useState<TenantInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.tenantSlug) setInfo(data)
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  return { tenantSlug: info?.tenantSlug ?? null, loading }
}
