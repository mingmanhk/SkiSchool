'use client'

import { useState, useEffect } from 'react'
import { useTenantSlug } from '@/hooks/useTenantSlug'

interface Program {
  id: string
  name: string
  visibilityStatus: string
  createdAt: string
}

export default function AdminProgramsPage() {
  const { tenantSlug, loading: tenantLoading } = useTenantSlug()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function loadPrograms() {
    if (!tenantSlug) return
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/${tenantSlug}/programs`)
      const json = await res.json()
      setPrograms(json.data ?? [])
    } catch {
      setError('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  async function createProgram(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !tenantSlug) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/${tenantSlug}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), visibilityStatus: 'public' }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(JSON.stringify(err.error))
        return
      }
      setNewName('')
      await loadPrograms()
    } catch {
      setError('Failed to create program')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    if (tenantSlug) loadPrograms()
  }, [tenantSlug])

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Programs</h1>

      {/* Create form */}
      <form onSubmit={createProgram} className="flex gap-3 mb-8">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New program name…"
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={creating || !tenantSlug}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'Create Program'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {tenantLoading || loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : programs.length === 0 ? (
        <p className="text-gray-400">No programs yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p.visibilityStatus} · created {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  p.visibilityStatus === 'public'
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {p.visibilityStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
