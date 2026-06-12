const BASE = import.meta.env.BASE_URL

interface NavLink {
  href: string
  label: string
}

const links: NavLink[] = [
  { href: BASE, label: 'Home' },
  { href: `${BASE}date-converter/`, label: 'Era Converter' },
  { href: `${BASE}postal-lookup/`, label: 'Postal Lookup' },
  { href: `${BASE}pr-calculator/`, label: 'PR Calculator' },
  { href: `${BASE}guides/`, label: 'Guides' },
]

export function renderNav(activePath: string): void {
  const nav = document.createElement('nav')
  nav.className = 'site-nav'
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-brand" href="${BASE}">Japan Toolkit</a>
      <ul class="nav-links">
        ${links
          .map(
            (l) =>
              `<li><a href="${l.href}" class="${l.href === activePath ? 'active' : ''}">${l.label}</a></li>`,
          )
          .join('')}
      </ul>
    </div>
  `
  document.body.prepend(nav)
}
