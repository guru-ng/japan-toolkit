const BASE = import.meta.env.BASE_URL

// Flat-vector scene (sun, Mt. Fuji, torii, houses, sakura) rendered as a fixed,
// low-opacity background layer behind the whole page, anchored to the bottom of
// the viewport. Injected on every page alongside the footer.
const PAGE_ART = `
  <div class="page-art" aria-hidden="true">
    <svg viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" role="presentation" focusable="false">
      <!-- sun -->
      <circle cx="230" cy="100" r="55" fill="#e0a82e" />
      <!-- clouds -->
      <g fill="#ffffff">
        <circle cx="470" cy="88" r="20" />
        <circle cx="498" cy="76" r="27" />
        <circle cx="528" cy="88" r="20" />
        <rect x="450" y="84" width="98" height="24" rx="12" />
      </g>
      <g fill="#fbeae9">
        <circle cx="1235" cy="72" r="16" />
        <circle cx="1260" cy="62" r="22" />
        <circle cx="1286" cy="72" r="16" />
        <rect x="1219" y="68" width="83" height="20" rx="10" />
      </g>
      <!-- Mt. Fuji -->
      <path d="M 770 360 L 1050 95 L 1330 360 Z" fill="#7c9cb8" />
      <path d="M 985 158 L 1050 95 L 1115 158 Q 1090 146 1071 159 Q 1050 172 1029 159 Q 1010 147 985 158 Z" fill="#fdfbf7" />
      <!-- back hill -->
      <ellipse cx="340" cy="470" rx="560" ry="130" fill="#8ab17d" />
      <!-- sakura tree -->
      <rect x="122" y="296" width="13" height="68" rx="4" fill="#8d6e63" />
      <g fill="#f2b8c6">
        <circle cx="103" cy="288" r="30" />
        <circle cx="140" cy="270" r="36" />
        <circle cx="172" cy="294" r="27" />
      </g>
      <!-- houses -->
      <rect x="840" y="310" width="60" height="52" fill="#f4e9d8" />
      <path d="M 832 312 L 870 282 L 908 312 Z" fill="#c0392b" />
      <rect x="915" y="322" width="48" height="40" fill="#e8918c" />
      <path d="M 908 324 L 939 298 L 970 324 Z" fill="#e0a82e" />
      <rect x="978" y="288" width="42" height="74" fill="#647d98" />
      <g fill="#fdfbf7">
        <rect x="985" y="298" width="10" height="10" rx="2" />
        <rect x="1003" y="298" width="10" height="10" rx="2" />
        <rect x="985" y="318" width="10" height="10" rx="2" />
        <rect x="1003" y="318" width="10" height="10" rx="2" />
      </g>
      <!-- torii gate -->
      <g fill="#c0392b">
        <rect x="585" y="248" width="15" height="114" rx="3" />
        <rect x="664" y="248" width="15" height="114" rx="3" />
        <rect x="577" y="272" width="110" height="11" rx="3" />
        <path d="M 560 232 Q 632 218 704 232 L 704 248 Q 632 236 560 248 Z" />
      </g>
      <!-- front hill -->
      <ellipse cx="1430" cy="500" rx="560" ry="150" fill="#58a99b" />
      <!-- scattered sakura petals -->
      <g fill="#f2b8c6">
        <circle cx="330" cy="180" r="6" />
        <circle cx="395" cy="245" r="5" />
        <circle cx="724" cy="150" r="6" />
        <circle cx="760" cy="210" r="4" />
        <circle cx="1180" cy="205" r="6" />
        <circle cx="1420" cy="150" r="5" />
        <circle cx="1490" cy="230" r="6" />
        <circle cx="528" cy="300" r="5" />
      </g>
    </svg>
  </div>
`

export function renderFooter(): void {
  const art = document.createElement('div')
  art.innerHTML = PAGE_ART
  document.body.append(art.firstElementChild as HTMLElement)

  const footer = document.createElement('footer')
  footer.className = 'site-footer'
  footer.innerHTML = `
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
