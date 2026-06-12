/**
 * Shared clipboard helper.
 * Builds a small icon button that copies a string to the clipboard and
 * shows a brief "copied" confirmation (icon swap + label).
 */

export function flashCopied(btn: HTMLButtonElement): void {
  const icon = btn.querySelector('.material-symbols-outlined')
  const label = btn.querySelector('.copy-btn-label')

  const originalIcon = icon?.textContent ?? null
  const originalLabel = label?.textContent ?? null

  if (icon) icon.textContent = 'check'
  if (label) label.textContent = 'Copied!'
  btn.classList.add('copied')

  window.clearTimeout((btn as any)._copyTimeout)
  ;(btn as any)._copyTimeout = window.setTimeout(() => {
    if (icon && originalIcon !== null) icon.textContent = originalIcon
    if (label && originalLabel !== null) label.textContent = originalLabel
    btn.classList.remove('copied')
  }, 1400)
}

export async function copyText(text: string, btn?: HTMLButtonElement): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    if (btn) flashCopied(btn)
    return true
  } catch {
    // Fallback for environments without Clipboard API access
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      if (btn) flashCopied(btn)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Creates a small "copy" icon button. `getText` is called at click time so
 * the copied value always reflects the latest result.
 */
export function createCopyButton(getText: () => string, label = 'Copy to clipboard'): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'copy-btn'
  btn.setAttribute('aria-label', label)
  btn.title = label
  btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">content_copy</span>'
  btn.addEventListener('click', () => {
    void copyText(getText(), btn)
  })
  return btn
}
