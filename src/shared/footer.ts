const BASE = import.meta.env.BASE_URL

// Compact flat-vector strip echoing the homepage hero (hills, Mt. Fuji, sun,
// torii, houses, sakura). Rendered at low opacity behind the footer content.
const FOOTER_ART = `
  <div class="footer-art" aria-hidden="true">
    <svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMax slice" role="presentation" focusable="false">
      <!-- sun -->
      <circle cx="150" cy="55" r="32" fill="#e0a82e" />
      <!-- Mt. Fuji -->
      <path d="M 850 200 L 1000 60 L 1150 200 Z" fill="#7c9cb8" />
      <path d="M 965 93 L 1000 60 L 1035 93 Q 1021 86 1011 93 Q 1000 100 989 93 Q 979 87 965 93 Z" fill="#fdfbf7" />
      <!-- back hill -->
      <ellipse cx="300" cy="250" rx="520" ry="110" fill="#8ab17d" />
      <!-- torii gate -->
      <g fill="#c0392b">
        <rect x="512" y="122" width="10" height="78" rx="2" />
        <rect x="566" y="122" width="10" height="78" rx="2" />
        <rect x="507" y="138" width="74" height="8" rx="2" />
        <path d="M 495 111 Q 544 101 593 111 L 593 122 Q 544 114 495 122 Z" />
      </g>
      <!-- houses -->
      <rect x="1190" y="160" width="44" height="40" fill="#f4e9d8" />
      <path d="M 1184 162 L 1212 140 L 1240 162 Z" fill="#c0392b" />
      <rect x="1246" y="168" width="36" height="32" fill="#e8918c" />
      <path d="M 1241 170 L 1264 151 L 1287 170 Z" fill="#e0a82e" />
      <!-- front hill -->
      <ellipse cx="1380" cy="265" rx="540" ry="120" fill="#58a99b" />
      <!-- sakura petals -->
      <g fill="#f2b8c6">
        <circle cx="320" cy="90" r="5" />
        <circle cx="420" cy="140" r="4" />
        <circle cx="700" cy="70" r="5" />
        <circle cx="1100" cy="110" r="4" />
        <circle cx="1440" cy="80" r="5" />
      </g>
    </svg>
  </div>
`

export function renderFooter(): void {
  const footer = document.createElement('footer')
  footer.className = 'site-footer'
  footer.innerHTML = `
    ${FOOTER_ART}
    <div class="footer-inner">
      <span>&copy; ${new Date().getFullYear()} Japan Toolkit</span>
      <span class="footer-links">
        <a href="${BASE}guides/">Guides</a>
        <a href="${BASE}privacy-policy/">Privacy Policy</a>
      </span>
    </div>
  `
  document.body.append(footer)
}
