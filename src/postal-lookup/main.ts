import '../shared/style.css'
import { renderNav } from '../shared/nav.ts'
import { renderFooter } from '../shared/footer.ts'
import { copyText } from '../shared/clipboard.ts'
import { lookupPostalCode, type ZipResult } from './zipcloud.ts'

renderNav(`${import.meta.env.BASE_URL}postal-lookup/`)
renderFooter()

const form = document.getElementById('lookup-form') as HTMLFormElement
const zipcodeInput = document.getElementById('zipcode') as HTMLInputElement
const lookupBtn = document.getElementById('lookup-btn') as HTMLButtonElement
const spinner = document.getElementById('spinner') as HTMLElement
const errorMsg = document.getElementById('lookup-error') as HTMLElement
const resultSection = document.getElementById('result-section') as HTMLElement
const resultCount = document.getElementById('result-count') as HTMLElement
const resultCards = document.getElementById('result-cards') as HTMLElement

// Auto-format input as XXX-XXXX while typing
zipcodeInput.addEventListener('input', () => {
  let v = zipcodeInput.value.replace(/[^0-9]/g, '').slice(0, 7)
  if (v.length > 3) v = `${v.slice(0, 3)}-${v.slice(3)}`
  zipcodeInput.value = v
})

function setLoading(loading: boolean): void {
  lookupBtn.disabled = loading
  spinner.style.display = loading ? 'inline' : 'none'
  lookupBtn.textContent = loading ? 'Searching…' : 'Search'
}

function showError(msg: string): void {
  errorMsg.textContent = msg
  errorMsg.classList.add('visible')
  resultSection.classList.add('hidden')
}

function clearError(): void {
  errorMsg.textContent = ''
  errorMsg.classList.remove('visible')
}

function buildAddressCard(r: ZipResult, idx: number): string {
  return `
    <div class="card" style="margin-top:${idx > 0 ? '0.75rem' : '0'}">
      <div class="card-header">
        <span class="result-label">Address ${idx + 1}</span>
        <button type="button" class="copy-btn" data-copy-idx="${idx}" aria-label="Copy address" title="Copy address">
          <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
          <span class="copy-btn-label">Copy</span>
        </button>
      </div>
      <div class="address-fields" style="margin-top:0">
        <div class="form-group" style="margin-bottom:0">
          <label for="addr-prefecture-${idx}">Prefecture / 都道府県</label>
          <input type="text" id="addr-prefecture-${idx}" value="${r.address1}" />
          <small style="color:var(--color-text-muted);font-size:0.78rem">${r.kana1}</small>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label for="addr-city-${idx}">City / 市区町村</label>
          <input type="text" id="addr-city-${idx}" value="${r.address2}" />
          <small style="color:var(--color-text-muted);font-size:0.78rem">${r.kana2}</small>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label for="addr-town-${idx}">Town / 町域</label>
          <input type="text" id="addr-town-${idx}" value="${r.address3}" />
          <small style="color:var(--color-text-muted);font-size:0.78rem">${r.kana3}</small>
        </div>
      </div>
    </div>
  `
}

function copyAddress(idx: number, btn: HTMLButtonElement): void {
  const prefecture = (document.getElementById(`addr-prefecture-${idx}`) as HTMLInputElement)?.value ?? ''
  const city = (document.getElementById(`addr-city-${idx}`) as HTMLInputElement)?.value ?? ''
  const town = (document.getElementById(`addr-town-${idx}`) as HTMLInputElement)?.value ?? ''
  const address = [prefecture, city, town].filter(Boolean).join('')
  void copyText(address, btn)
}

async function handleLookup(): Promise<void> {
  clearError()
  setLoading(true)
  resultSection.classList.add('hidden')

  const raw = zipcodeInput.value.trim()
  const result = await lookupPostalCode(raw)

  setLoading(false)

  if (!result.ok) {
    showError(result.error)
    return
  }

  const { results } = result
  resultCount.textContent =
    results.length === 1
      ? 'Found 1 address'
      : `Found ${results.length} addresses (some postal codes cover multiple areas)`

  resultCards.innerHTML = results.map((r, i) => buildAddressCard(r, i)).join('')
  resultSection.classList.remove('hidden')
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  void handleLookup()
})

// Event delegation for per-card copy buttons (cards are re-rendered on each search)
resultCards.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.copy-btn[data-copy-idx]')
  if (!btn) return
  const idx = parseInt(btn.dataset['copyIdx'] ?? '', 10)
  if (!isNaN(idx)) copyAddress(idx, btn)
})
