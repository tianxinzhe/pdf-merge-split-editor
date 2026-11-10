(function () {
  'use strict'

  var STORAGE_KEY = 'lemon-consent'
  var storedLocale = null
  try { storedLocale = localStorage.getItem('lemon-pdf-locale') } catch (error) { /* storage may be blocked */ }
  var locale = storedLocale || (navigator.language || 'en').slice(0, 2)
  var copy = {
    zh: {
      title: '你的隐私选择',
      body: '我们使用 Google AdSense 展示广告。接受后，Google 可能使用 Cookie 提供个性化广告；选择「仅必要」时，广告存储与个性化默认关闭。',
      accept: '接受全部',
      essential: '仅必要',
      privacy: '隐私政策',
      close: '关闭',
    },
    en: {
      title: 'Your privacy choices',
      body: 'We use Google AdSense to show ads. Accepting allows Google to use cookies for personalized advertising. “Essential only” keeps ad storage and personalization off.',
      accept: 'Accept all',
      essential: 'Essential only',
      privacy: 'Privacy Policy',
      close: 'Close',
    },
    ko: {
      title: '개인정보 선택',
      body: 'Google AdSense 광고를 사용합니다. 동의하면 Google이 맞춤형 광고를 위해 쿠키를 사용할 수 있습니다. “필수만”을 선택하면 광고 저장과 맞춤화가 꺼집니다.',
      accept: '모두 허용',
      essential: '필수만',
      privacy: '개인정보 처리방침',
      close: '닫기',
    },
    ja: {
      title: 'プライバシーの選択',
      body: 'Google AdSense で広告を表示しています。同意すると、Google がパーソナライズ広告のために Cookie を使用する場合があります。「必須のみ」では広告ストレージと個人最適化がオフになります。',
      accept: 'すべて許可',
      essential: '必須のみ',
      privacy: 'プライバシーポリシー',
      close: '閉じる',
    },
    de: {
      title: 'Deine Datenschutzauswahl',
      body: 'Wir zeigen Anzeigen über Google AdSense. Mit „Alle akzeptieren“ darf Google Cookies für personalisierte Werbung verwenden. „Nur notwendige“ deaktiviert Anzeigenspeicher und Personalisierung.',
      accept: 'Alle akzeptieren',
      essential: 'Nur notwendige',
      privacy: 'Datenschutz',
      close: 'Schließen',
    },
  }
  var t = copy[locale] || copy.en

  function gtag() {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(arguments)
  }

  function updateConsent(granted) {
    gtag('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
    })
  }

  var stored = null
  try { stored = localStorage.getItem(STORAGE_KEY) } catch (error) { /* storage may be blocked */ }

  if (stored === 'granted' || stored === 'denied') {
    updateConsent(stored === 'granted')
    return
  }

  function choose(value) {
    try { localStorage.setItem(STORAGE_KEY, value) } catch (error) { /* ignore */ }
    updateConsent(value === 'granted')
    var banner = document.getElementById('lemon-consent-banner')
    if (banner) banner.remove()
  }

  function render() {
    if (document.getElementById('lemon-consent-banner')) return

    var style = document.createElement('style')
    style.textContent = [
      '#lemon-consent-banner{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:9999;margin:0 auto;max-width:640px;background:#0b1220;border:1px solid #334155;border-radius:16px;padding:16px 18px;box-shadow:0 20px 50px rgba(0,0,0,.5);color:#e5e7eb;font:13px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}',
      '#lemon-consent-banner strong{display:block;font-size:14px;margin-bottom:4px;color:#fff}',
      '#lemon-consent-banner p{margin:0;color:#9ca3af}',
      '#lemon-consent-banner .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}',
      '#lemon-consent-banner button{appearance:none;border:1px solid #334155;border-radius:9px;padding:7px 14px;font:inherit;cursor:pointer;background:#111827;color:#e5e7eb;touch-action:manipulation}',
      '#lemon-consent-banner button.primary{background:#2563eb;border-color:#2563eb;color:#fff}',
      '#lemon-consent-banner .close{position:absolute;top:6px;right:8px;border:0;background:transparent;color:#94a3b8;font-size:20px;line-height:1;padding:4px 8px}',
      '#lemon-consent-banner a{color:#60a5fa;text-decoration:none;font-size:12px}',
      '@media(max-width:520px){#lemon-consent-banner{left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));padding:12px 14px;border-radius:14px}#lemon-consent-banner p{display:none}#lemon-consent-banner strong{font-size:13px;margin-bottom:0;padding-right:24px}#lemon-consent-banner .row{margin-top:10px;gap:6px}#lemon-consent-banner button{flex:1;padding:7px 10px;font-size:12px}#lemon-consent-banner a{font-size:11px}}',
    ].join('')
    document.head.appendChild(style)

    var box = document.createElement('div')
    box.id = 'lemon-consent-banner'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-label', t.title)
    box.innerHTML = '<button type="button" class="close" data-consent="denied" aria-label="' + t.close + '">×</button>' +
      '<strong>' + t.title + '</strong><p>' + t.body + '</p>' +
      '<div class="row"><button type="button" class="primary" data-consent="granted">' + t.accept + '</button>' +
      '<button type="button" data-consent="denied">' + t.essential + '</button>' +
      '<a href="/privacy/">' + t.privacy + '</a></div>'
    box.addEventListener('click', function (event) {
      var target = event.target
      if (!target || !target.getAttribute) return
      var value = target.getAttribute('data-consent')
      if (value) choose(value)
    })
    document.body.appendChild(box)
  }

  if (document.body) render()
  else document.addEventListener('DOMContentLoaded', render, { once: true })
})()