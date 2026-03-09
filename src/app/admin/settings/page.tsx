'use client'

import { useState } from 'react'
import { useTenantSlug } from '@/hooks/useTenantSlug'

export default function AdminSettingsPage() {
  const { tenantSlug } = useTenantSlug()
  const [hero, setHero] = useState({ title: '', subtitle: '', ctaText: '', ctaUrl: '' })
  const [brandColor, setBrandColor] = useState('#0066cc')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function saveSiteConfig(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantSlug) return
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/v1/${tenantSlug}/site/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero,
          branding: { primaryColor: brandColor },
        }),
      })
      setMsg(res.ok ? '✓ Settings saved.' : 'Failed to save settings.')
    } catch {
      setMsg('Network error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-400 mb-8">Customize your public-facing site.</p>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Site Config</h2>
        <form onSubmit={saveSiteConfig} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Hero Title</label>
            <input
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              placeholder="Welcome to Alpine Ski School"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Hero Subtitle</label>
            <input
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              placeholder="Expert instruction for all levels"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">CTA Button Text</label>
              <input
                value={hero.ctaText}
                onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                placeholder="Register Now"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">CTA URL</label>
              <input
                value={hero.ctaUrl}
                onChange={(e) => setHero({ ...hero, ctaUrl: e.target.value })}
                placeholder="/register"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Brand Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-9 w-16 cursor-pointer rounded border border-gray-600 bg-gray-900"
              />
              <span className="text-sm font-mono text-gray-300">{brandColor}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !tenantSlug}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          {msg && <p className="text-sm text-gray-300">{msg}</p>}
        </form>
      </div>
    </div>
  )
}
