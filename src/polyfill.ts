// Polyfill for __dirname in Edge Runtime
// This file must be imported before any other imports that might use __dirname

if (typeof __dirname === 'undefined') {
  (globalThis as any).__dirname = '';
}

if (typeof __filename === 'undefined') {
  (globalThis as any).__filename = '';
}

export {};
