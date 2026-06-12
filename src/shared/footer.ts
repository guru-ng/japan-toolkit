const BASE = import.meta.env.BASE_URL

export function renderFooter(): void {
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
