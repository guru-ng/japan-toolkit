import '../shared/style.css'
import { renderNav } from '../shared/nav.ts'
import { renderFooter } from '../shared/footer.ts'
import { copyText } from '../shared/clipboard.ts'
import {
  ERAS,
  gregorianToEra,
  eraToGregorian,
  formatGregorian,
  formatEraDate,
  intlCrossCheck,
} from './era-logic.ts'

renderNav(`${import.meta.env.BASE_URL}date-converter/`)
renderFooter()

// ── Gregorian → Era section ──────────────────────────────────────────────────

const gDateInput = document.getElementById('g-date') as HTMLInputElement
const gConvertBtn = document.getElementById('g-convert') as HTMLButtonElement
const gResult = document.getElementById('g-result') as HTMLDivElement
const gResultValue = document.getElementById('g-result-value') as HTMLElement
const gResultIntl = document.getElementById('g-result-intl') as HTMLElement
const gError = document.getElementById('g-error') as HTMLElement
const gCopyBtn = document.getElementById('g-copy') as HTMLButtonElement

gConvertBtn.addEventListener('click', () => {
  const val = gDateInput.value // "YYYY-MM-DD"
  gError.classList.remove('visible')
  gResult.classList.add('hidden')

  if (!val) {
    gError.textContent = 'Please pick a date.'
    gError.classList.add('visible')
    return
  }

  const [y, m, d] = val.split('-').map(Number)
  const result = gregorianToEra({ year: y, month: m, day: d })

  if (!result.ok) {
    gError.textContent = result.error
    gError.classList.add('visible')
    return
  }

  gResultValue.textContent = formatEraDate(result.value)

  const intl = intlCrossCheck({ year: y, month: m, day: d })
  if (intl) {
    gResultIntl.textContent = `Intl cross-check: ${intl}`
    gResultIntl.style.display = 'block'
  } else {
    gResultIntl.style.display = 'none'
  }

  gResult.classList.remove('hidden')
})

// Allow Enter key on date input
gDateInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') gConvertBtn.click()
})

gCopyBtn.addEventListener('click', () => {
  void copyText(gResultValue.textContent ?? '', gCopyBtn)
})

// ── Era → Gregorian section ──────────────────────────────────────────────────

const eEraSelect = document.getElementById('e-era') as HTMLSelectElement
const eYearInput = document.getElementById('e-year') as HTMLInputElement
const eMonthInput = document.getElementById('e-month') as HTMLInputElement
const eDayInput = document.getElementById('e-day') as HTMLInputElement
const eConvertBtn = document.getElementById('e-convert') as HTMLButtonElement
const eResult = document.getElementById('e-result') as HTMLDivElement
const eResultValue = document.getElementById('e-result-value') as HTMLElement
const eError = document.getElementById('e-error') as HTMLElement
const eCopyBtn = document.getElementById('e-copy') as HTMLButtonElement

// Populate era select options
ERAS.forEach((era) => {
  const opt = document.createElement('option')
  opt.value = era.romaji
  opt.textContent = `${era.romaji} (${era.kanji})`
  eEraSelect.appendChild(opt)
})
// Default to Reiwa (last/current)
eEraSelect.value = 'Reiwa'

eConvertBtn.addEventListener('click', () => {
  eError.classList.remove('visible')
  eResult.classList.add('hidden')

  const eraName = eEraSelect.value
  const year = parseInt(eYearInput.value, 10)
  const month = parseInt(eMonthInput.value, 10)
  const day = parseInt(eDayInput.value, 10)

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    eError.textContent = 'Please fill in year, month, and day.'
    eError.classList.add('visible')
    return
  }

  const result = eraToGregorian(eraName, year, month, day)
  if (!result.ok) {
    eError.textContent = result.error
    eError.classList.add('visible')
    return
  }

  const g = result.value
  eResultValue.textContent = formatGregorian(
    new Date(Date.UTC(g.year, g.month - 1, g.day)),
  )
  eResult.classList.remove('hidden')
})

;[eYearInput, eMonthInput, eDayInput].forEach((inp) => {
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') eConvertBtn.click()
  })
})

eCopyBtn.addEventListener('click', () => {
  void copyText(eResultValue.textContent ?? '', eCopyBtn)
})
