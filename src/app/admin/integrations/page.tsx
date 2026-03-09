'use client'

import { useState } from 'react'
import { useTenantSlug } from '@/hooks/useTenantSlug'

interface FieldProps {
  label: string
  id: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

function Field({ label, id, type = 'text', value, onChange, placeholder }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}

export default function AdminIntegrationsPage() {
  const [stripePublishable, setStripePublishable] = useState('')
  const [stripeSecret, setStripeSecret] = useState('')
  const [stripeWebhook, setStripeWebhook] = useState('')
  const [stripeSaving, setStripeSaving] = useState(false)
  const [stripeMsg, setStripeMsg] = useState<string | null>(null)

  const [qbClientId, setQbClientId] = useState('')
  const [qbClientSecret, setQbClientSecret] = useState('')
  const [qbConnecting, setQbConnecting] = useState(false)
  const [qbMsg, setQbMsg] = useState<string | null>(null)

  const { tenantSlug } = useTenantSlug()

  async function saveStripe(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantSlug) return
    setStripeSaving(true)
    setStripeMsg(null)
    try {
      const res = await fetch(`/api/v1/${tenantSlug}/admin/integrations/stripe`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publishableKey: stripePublishable,
          secretKey: stripeSecret,
          webhookSecret: stripeWebhook || undefined,
        }),
      })
      setStripeMsg(res.ok ? '✓ Stripe config saved.' : 'Failed to save Stripe config.')
    } catch {
      setStripeMsg('Network error.')
    } finally {
      setStripeSaving(false)
    }
  }

  async function connectQuickBooks(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantSlug) return
    setQbConnecting(true)
    setQbMsg(null)
    try {
      // First save QB credentials, then initiate OAuth
      const saveRes = await fetch(`/api/v1/${tenantSlug}/admin/integrations/quickbooks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: qbClientId, clientSecret: qbClientSecret }),
      })
      if (!saveRes.ok) { setQbMsg('Failed to save QuickBooks credentials.'); return }

      const oauthRes = await fetch(`/api/v1/${tenantSlug}/admin/integrations/quickbooks/auth`)
      const { authUrl } = await oauthRes.json()
      if (authUrl) window.location.href = authUrl
      else setQbMsg('Failed to get QuickBooks auth URL.')
    } catch {
      setQbMsg('Network error.')
    } finally {
      setQbConnecting(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl space-y-10">
      <h1 className="text-3xl font-bold">Integrations</h1>

      {/* Stripe */}
      <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-1">Stripe Payments</h2>
        <p className="text-sm text-gray-400 mb-4">Accept credit card payments from families.</p>
        <form onSubmit={saveStripe} className="space-y-3">
          <Field label="Publishable Key" id="stripe-pk" value={stripePublishable} onChange={setStripePublishable} placeholder="pk_live_…" />
          <Field label="Secret Key" id="stripe-sk" type="password" value={stripeSecret} onChange={setStripeSecret} placeholder="sk_live_…" />
          <Field label="Webhook Secret (optional)" id="stripe-wh" type="password" value={stripeWebhook} onChange={setStripeWebhook} placeholder="whsec_…" />
          <button
            type="submit"
            disabled={stripeSaving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {stripeSaving ? 'Saving…' : 'Save Stripe Config'}
          </button>
          {stripeMsg && <p className="text-sm text-gray-300">{stripeMsg}</p>}
        </form>
      </section>

      {/* QuickBooks */}
      <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-1">QuickBooks</h2>
        <p className="text-sm text-gray-400 mb-4">Sync enrollments and payments to QuickBooks Online.</p>
        <form onSubmit={connectQuickBooks} className="space-y-3">
          <Field label="Client ID" id="qb-id" value={qbClientId} onChange={setQbClientId} placeholder="QuickBooks OAuth Client ID" />
          <Field label="Client Secret" id="qb-secret" type="password" value={qbClientSecret} onChange={setQbClientSecret} placeholder="QuickBooks OAuth Client Secret" />
          <button
            type="submit"
            disabled={qbConnecting}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {qbConnecting ? 'Redirecting…' : 'Connect QuickBooks'}
          </button>
          {qbMsg && <p className="text-sm text-gray-300">{qbMsg}</p>}
        </form>
      </section>
    </div>
  )
}
