
(function() {
  const containerId = 'skischoolos-class-selector';
  const container = document.getElementById(containerId);
  if (!container) return;

  const scriptTag = document.querySelector(`script[src*="class-selector.js"]`);
  const tenantSlug = scriptTag.getAttribute('data-tenant');
  const lang = scriptTag.getAttribute('data-language') || 'en';
  const apiUrl = `https://your-app-url.com/api/v1/${tenantSlug}`;

  // Localized Labels for Widget (Fallback)
  const labels = {
    en: { title: 'Find a Lesson', book: 'Book', loading: 'Loading programs...' },
    zh: { title: '查找课程', book: '预订', loading: '正在加载课程...' }
  };
  const t = labels[lang] || labels.en;

  // Basic Styles
  const style = document.createElement('style');
  style.textContent = `
    .sso-widget { font-family: sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 8px; max-width: 600px; }
    .sso-program { margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 4px; }
    .sso-btn { background: #0070f3; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; }
  `;
  document.head.appendChild(style);

  // Render Logic
  async function init() {
    container.innerHTML = `<div class="sso-widget"><h3>${t.title}</h3><p>${t.loading}</p></div>`;

    try {
      const res = await fetch(`${apiUrl}/programs?lang=${lang}`);
      const json = await res.json();

      if (json.error) throw new Error(json.error);

      let html = `<div class="sso-widget"><h3>${t.title}</h3>`;
      
      json.data.forEach(p => {
        html += `
          <div class="sso-program">
            <h4>${p.name}</h4>
            <p>${p.description}</p>
            <p><small>${lang === 'zh' ? '年龄' : 'Age'}: ${p.min_age}-${p.max_age}</small></p>
            <button class="sso-btn" onclick="window.location.href='https://your-app-url.com/${lang}/book/${p.id}'">${t.book}</button>
          </div>
        `;
      });

      html += `</div>`;
      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = `<div class="sso-widget"><p style="color:red">Error: ${e.message}</p></div>`;
    }
  }

  init();
})();
