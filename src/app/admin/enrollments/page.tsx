'use client'

import { useState, useEffect } from 'react'
import { useTenantSlug } from '@/hooks/useTenantSlug'

interface Enrollment {
  id: string
  studentId: string
  programId: string
  status: string
  amountCents: number | null
  createdAt: string
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'waitlisted']

export default function AdminEnrollmentsPage() {
  const { tenantSlug, loading: tenantLoading } = useTenantSlug()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadEnrollments() {
    if (!tenantSlug) return
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/${tenantSlug}/admin/enrollments`)
      const json = await res.json()
      setEnrollments(json.data ?? [])
    } catch {
      setError('Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(enrollmentId: string, status: string) {
    if (!tenantSlug) return
    setUpdating(enrollmentId)
    setError(null)
    try {
      const res = await fetch(`/api/v1/${tenantSlug}/admin/enrollments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, status }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Update failed')
        return
      }
      await loadEnrollments()
    } catch {
      setError('Failed to update enrollment')
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    if (tenantSlug) loadEnrollments()
  }, [tenantSlug])

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-900/50 text-yellow-400',
    confirmed: 'bg-green-900/50 text-green-400',
    cancelled: 'bg-red-900/50 text-red-400',
    waitlisted: 'bg-blue-900/50 text-blue-400',
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Enrollments</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {tenantLoading || loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : enrollments.length === 0 ? (
        <p className="text-gray-400">No enrollments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700 text-gray-400">
                <th className="pb-3 pr-4">Enrollment ID</th>
                <th className="pb-3 pr-4">Student</th>
                <th className="pb-3 pr-4">Program</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {enrollments.map((e) => (
                <tr key={e.id} className="py-3">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">{e.id.slice(0, 8)}…</td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">{e.studentId.slice(0, 8)}…</td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">{e.programId.slice(0, 8)}…</td>
                  <td className="py-3 pr-4">
                    {e.amountCents != null ? `$${(e.amountCents / 100).toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[e.status] ?? 'bg-gray-700 text-gray-400'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <select
                      disabled={updating === e.id}
                      value={e.status}
                      onChange={(ev) => updateStatus(e.id, ev.target.value)}
                      className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
