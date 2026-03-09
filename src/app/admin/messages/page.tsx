'use client'

import { useState } from 'react'
import { useTenantSlug } from '@/hooks/useTenantSlug'

export default function AdminMessagesPage() {
  const { tenantSlug } = useTenantSlug()
  const [templateName, setTemplateName] = useState('')
  const [channel, setChannel] = useState<'sms' | 'email'>('sms')
  const [body, setBody] = useState('')
  const [variables, setVariables] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function saveTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantSlug) return
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/v1/${tenantSlug}/admin/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          channel,
          body,
          variables: variables ? variables.split(',').map((v) => v.trim()) : [],
        }),
      })
      setMsg(res.ok ? '✓ Template saved.' : 'Failed to save template.')
      if (res.ok) { setTemplateName(''); setBody(''); setVariables('') }
    } catch {
      setMsg('Network error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Messages</h1>
      <p className="text-gray-400 mb-8">Create message templates for SMS and email campaigns.</p>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">New Template</h2>
        <form onSubmit={saveTemplate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Template Name</label>
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Welcome SMS"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as 'sms' | 'email')}
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Body <span className="text-gray-500">(use {'{{variable}}'} syntax)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Hello {{name}}, your enrollment is confirmed!"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Variables (comma-separated)</label>
            <input
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              placeholder="name, date, program"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !tenantSlug}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Template'}
          </button>
          {msg && <p className="text-sm text-gray-300">{msg}</p>}
        </form>
      </div>
    </div>
  )
}
