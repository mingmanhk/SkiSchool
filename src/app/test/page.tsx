import Link from 'next/link'

export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Test Page</h1>
      <p>This is a static test page to verify Vercel deployment.</p>
      <p>Deployment Test Timestamp: {new Date().toISOString()}</p>
      <p>Environment Check:</p>
      <ul>
        <li>NODE_ENV: {process.env.NODE_ENV}</li>
      </ul>
      <div style={{ marginTop: '20px' }}>
        <Link href="/" style={{ marginRight: '20px' }}>Go to Root</Link>
        <Link href="/en">Go to /en</Link>
      </div>
    </div>
  )
}
