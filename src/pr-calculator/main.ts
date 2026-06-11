import '../shared/style.css'
import { renderNav } from '../shared/nav.ts'
import { calculateScore, type FormValues, type Category } from './scoring.ts'

renderNav(`${import.meta.env.BASE_URL}pr-calculator/`)

// ── DOM refs ─────────────────────────────────────────────────────────────────

const categoryBtns = document.querySelectorAll<HTMLButtonElement>('[data-category]')
const academicSection = document.getElementById('academic-section') as HTMLElement
const scoreNumber = document.getElementById('score-number') as HTMLElement
const scoreStatus = document.getElementById('score-status') as HTMLElement
const scoreDisplay = document.getElementById('score-display') as HTMLElement
const breakdownBody = document.getElementById('breakdown-body') as HTMLElement

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

// ── State ─────────────────────────────────────────────────────────────────────

let currentCategory: Category = 'technical'

// ── Category tabs ─────────────────────────────────────────────────────────────

categoryBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
    currentCategory = btn.dataset['category'] as Category
    // Research fields only for academic + technical
    academicSection.style.display =
      currentCategory === 'business' ? 'none' : 'block'
    recalculate()
  })
})

// ── Read form values ──────────────────────────────────────────────────────────

function readForm(): FormValues {
  return {
    category: currentCategory,
    academicDegree: (el<HTMLSelectElement>('academic-degree').value as FormValues['academicDegree']),
    dualDegree: el<HTMLInputElement>('dual-degree').checked,
    careerYears: parseInt(el<HTMLInputElement>('career-years').value, 10) || 0,
    annualSalaryJPY: parseInt(el<HTMLInputElement>('salary').value, 10) || 0,
    age: parseInt(el<HTMLInputElement>('age').value, 10) || 0,
    japaneseLevel: (el<HTMLSelectElement>('japanese-level').value as FormValues['japaneseLevel']),
    patents: parseInt(el<HTMLInputElement>('patents').value, 10) || 0,
    publications: parseInt(el<HTMLInputElement>('publications').value, 10) || 0,
    conductedResearch: el<HTMLInputElement>('conducted-research').checked,
    investmentAmount: el<HTMLInputElement>('investment').checked,
    graduatedJapaneseUniv: el<HTMLInputElement>('grad-jp-univ').checked,
    workedInJapan: el<HTMLInputElement>('worked-japan').checked,
    certifiedSME: el<HTMLInputElement>('certified-sme').checked,
    growthFieldBonus: el<HTMLInputElement>('growth-field').checked,
  }
}

// ── Recalculate ───────────────────────────────────────────────────────────────

function recalculate(): void {
  const result = calculateScore(readForm())

  scoreNumber.textContent = String(result.total)

  scoreDisplay.classList.remove('eligible', 'fast-track')
  scoreStatus.classList.remove('eligible', 'fast-track')

  if (result.status === 'eligible_1yr') {
    scoreDisplay.classList.add('fast-track')
    scoreStatus.classList.add('fast-track')
  } else if (result.status === 'eligible_3yr') {
    scoreDisplay.classList.add('eligible')
    scoreStatus.classList.add('eligible')
  }
  scoreStatus.textContent = result.statusLabel

  breakdownBody.innerHTML = result.breakdown
    .map(
      (b) => `
      <div class="breakdown-row">
        <span>${b.label}</span>
        <span class="breakdown-pts" data-pts="${b.points}">${b.points > 0 ? `+${b.points}` : b.points}</span>
      </div>`,
    )
    .join('')
}

// ── Wire up live recalculation ────────────────────────────────────────────────

document.querySelectorAll('input, select').forEach((inp) => {
  inp.addEventListener('input', recalculate)
  inp.addEventListener('change', recalculate)
})

// Initial render
recalculate()
