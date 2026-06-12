import '../shared/style.css'
import { renderNav } from '../shared/nav.ts'
import {
  calculateScore,
  type FormValues,
  type Category,
  type DegreeType,
  type PositionType,
} from './scoring.ts'

renderNav(`${import.meta.env.BASE_URL}pr-calculator/`)

// ── Helpers ───────────────────────────────────────────────────────────────────

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

function inp(id: string): HTMLInputElement  { return el<HTMLInputElement>(id) }
function sel(id: string): HTMLSelectElement { return el<HTMLSelectElement>(id) }
function sec(id: string): HTMLElement       { return el(id) }

function showSection(id: string, visible: boolean): void {
  sec(id).style.display = visible ? '' : 'none'
}

// ── State ─────────────────────────────────────────────────────────────────────

let currentCategory: Category = 'technical'

// ── Category tabs ─────────────────────────────────────────────────────────────

const categoryBtns = document.querySelectorAll<HTMLButtonElement>('[data-category]')

categoryBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
    currentCategory = btn.dataset['category'] as Category
    updateSectionVisibility()
    recalculate()
  })
})

function updateSectionVisibility(): void {
  const isAcademic  = currentCategory === 'academic'
  const isTechnical = currentCategory === 'technical'
  const isBusiness  = currentCategory === 'business'

  // Research achievements: (a) and (b) only
  showSection('section-research',        !isBusiness)
  // Qualifications: (b) only
  showSection('section-qualifications',   isTechnical)
  // Position: (c) only
  showSection('section-position',         isBusiness)
  // Age: (a) and (b) only
  showSection('section-age',             !isBusiness)
  // Salary label hint changes
  el('salary-hint-matrix').style.display  = isBusiness ? 'none' : ''
  el('salary-hint-flat').style.display    = isBusiness ? '' : 'none'
  // Financial sector bonus: (b) and (c) only
  showSection('bonus-financial-row',     !isAcademic)
  // Self-investment: (c) only
  showSection('bonus-selfinvest-row',     isBusiness)
  // Degree hint text
  el('degree-hint-b').style.display      = isTechnical ? '' : 'none'
  el('degree-hint-c').style.display      = isBusiness  ? '' : 'none'
  el('degree-hint-a').style.display      = isAcademic  ? '' : 'none'
}

// ── Read form ─────────────────────────────────────────────────────────────────

function readQualCount(id: string): 0 | 1 | 2 {
  const v = parseInt(sel(id).value, 10)
  return (v === 0 ? 0 : v === 1 ? 1 : 2) as 0 | 1 | 2
}

function readForm(): FormValues {
  return {
    category:        currentCategory,
    degree:          sel('degree').value as DegreeType,
    dualDegree:      inp('dual-degree').checked,
    careerYears:     parseInt(inp('career-years').value, 10) || 0,
    annualSalaryJPY: parseInt(inp('salary').value, 10) || 0,
    age:             parseInt(inp('age').value, 10) || 0,
    patentInventor:  inp('research-patent').checked,
    govtResearch:    inp('research-govt').checked,
    publishedPapers: inp('research-papers').checked,
    researchAward:   inp('research-award').checked,
    nationalQuals:   readQualCount('qual-national'),
    itExams:         readQualCount('qual-itexam'),
    itCerts:         readQualCount('qual-itcert'),
    position:        sel('position').value as PositionType,
    employerInnovation: sel('employer-innovation').value as FormValues['employerInnovation'],
    smeRdRatio:      inp('bonus-sme-rd').checked,
    foreignQualBonus: inp('bonus-foreign-qual').checked,
    japaneseUniv:    inp('bonus-jp-univ').checked,
    jlptN1orBJT480:  inp('bonus-n1').checked,
    jlptN2orBJT400:  inp('bonus-n2').checked,
    growthField:     inp('bonus-growth').checked,
    designatedUniv:  inp('bonus-desig-univ').checked,
    designatedTraining: inp('bonus-training').checked,
    financialSector: inp('bonus-financial').checked,
    selfInvestment:  inp('bonus-selfinvest').checked,
  }
}

// ── Language bonus mutual-exclusion hint ──────────────────────────────────────

function updateLanguageHint(): void {
  const hasN1  = inp('bonus-n1').checked
  const hasJpU = inp('bonus-jp-univ').checked
  const n2row  = el('bonus-n2-row')
  const n2note = el('bonus-n2-excluded-note')

  if (hasN1 || hasJpU) {
    n2row.style.opacity = '0.45'
    n2note.style.display = ''
  } else {
    n2row.style.opacity = ''
    n2note.style.display = 'none'
  }
}

// ── Recalculate ───────────────────────────────────────────────────────────────

const scoreNumber  = el('score-number')
const scoreStatus  = el('score-status')
const scoreDisplay = el('score-display')
const breakdownBody = el('breakdown-body')
const gateWarning  = el('gate-warning')
const gateMsg      = el('gate-msg')

function recalculate(): void {
  const result = calculateScore(readForm())

  scoreNumber.textContent = String(result.total)

  scoreDisplay.classList.remove('eligible', 'fast-track', 'gate-fail')
  scoreStatus.classList.remove('eligible', 'fast-track')

  if (result.gateFailed) {
    scoreDisplay.classList.add('gate-fail')
    gateWarning.style.display = ''
    gateMsg.textContent = result.gateMessage ?? ''
  } else {
    gateWarning.style.display = 'none'
    if (result.status === 'eligible_1yr') {
      scoreDisplay.classList.add('fast-track')
      scoreStatus.classList.add('fast-track')
    } else if (result.status === 'eligible_3yr') {
      scoreDisplay.classList.add('eligible')
      scoreStatus.classList.add('eligible')
    }
  }

  scoreStatus.textContent = result.statusLabel

  breakdownBody.innerHTML = result.breakdown
    .map((b) => {
      const pts = b.points > 0 ? `+${b.points}` : String(b.points)
      return `<div class="breakdown-row">
        <span class="breakdown-label">${b.label}</span>
        <span class="breakdown-pts" data-pts="${b.points}">${pts}</span>
      </div>`
    })
    .join('')

  updateLanguageHint()
}

// ── Wire inputs ───────────────────────────────────────────────────────────────

document.querySelectorAll('input, select').forEach((inp) => {
  inp.addEventListener('input', recalculate)
  inp.addEventListener('change', recalculate)
})

// ── Init ──────────────────────────────────────────────────────────────────────

updateSectionVisibility()
recalculate()
