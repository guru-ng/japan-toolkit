// ============================================================================
// Japan Highly Skilled Foreign Professional (高度専門職1号) Points Calculator
//
// Sources (retrieved June 2026):
//   ISA ministerial ordinance 930001658
//   Special addition notice 930001665
//   Official points table 001398882
//   ISA overview: https://www.isa.go.jp/en/publications/materials/nyuukokukanri07_00149.html
//   MOJ overview: https://www.moj.go.jp/isa/applications/status/skilled.html
//
// Eligibility: score ≥70 in any one category qualifies for HSP status.
// PR fast-track: 80+ pts sustained for 1 yr, or 70+ pts sustained for 3 yrs.
// Salary gate: categories (b) and (c) require annual salary ≥¥3,000,000.
// ============================================================================

export type Category = 'academic' | 'technical' | 'business'
// (a) academic  = Advanced Academic Research Activities    高度学術研究活動
// (b) technical = Advanced Specialized/Technical Activities 高度専門・技術活動
// (c) business  = Advanced Business Management Activities  高度経営・管理活動

export type DegreeType = 'none' | 'bachelor' | 'master' | 'mba_mot' | 'doctor'
// mba_mot: MBA (Master of Business Administration) or MOT (Management of Technology)
// Scores as 25 pts in (b)/(c) vs 20 pts (treated as master's) in (a).

export type PositionType = 'none' | 'director' | 'rep_director'
// director:     Director or Executive Officer
// rep_director: Representative Director or Executive Officer (higher role)

export interface FormValues {
  category: Category

  // ── Academic background (all categories) ──────────────────────────────────
  degree: DegreeType
  dualDegree: boolean           // holds degrees in 2+ different academic fields (+5)

  // ── Professional career ───────────────────────────────────────────────────
  careerYears: number           // years of relevant professional experience

  // ── Annual salary (JPY) ───────────────────────────────────────────────────
  annualSalaryJPY: number

  // ── Age (categories a/b only — not scored for c) ─────────────────────────
  age: number

  // ── Research achievements — 4 qualifying items (categories a/b only) ──────
  patentInventor: boolean       // named inventor on ≥1 patent
  govtResearch: boolean         // led research endorsed/funded by a government body
  publishedPapers: boolean      // published peer-reviewed academic papers
  researchAward: boolean        // received commendation/award for research contributions

  // ── Qualifications (category b only) ──────────────────────────────────────
  // Points: any one category at 2+, OR two distinct categories at 1+ each = 10
  //         one item in any category = 5
  nationalQuals: 0 | 1 | 2     // relevant Japanese national qualifications (2 = "2 or more")
  itExams: 0 | 1 | 2           // passed designated IT engineer exams (2 = "2 or more")
  itCerts: 0 | 1 | 2           // holds designated IT certifications (2 = "2 or more")

  // ── Position (category c only) ────────────────────────────────────────────
  position: PositionType        // Representative director=10, Director=5

  // ── Bonus items 1–12 (Special Additions — stack additively) ──────────────
  // #1/#2 are mutually exclusive; #1 takes precedence if both somehow selected
  employerInnovation: 'none' | 'sme' | 'non_sme'
  //   sme:     Employer is an SME with innovation-promotion certification (+20)
  //   non_sme: Employer has innovation-promotion certification, non-SME (+10)

  smeRdRatio: boolean           // #3: Employer (SME) R&D expense ratio >3% of revenue (+5)
  foreignQualBonus: boolean     // #4: Foreign qualification/award contributing to innovation (+5)

  // Language/education — #7 is excluded if #5 or #6 applies; #5 and #6 can stack
  japaneseUniv: boolean         // #5: Graduate of Japanese university (+10)
  jlptN1orBJT480: boolean       // #6: JLPT N1, majored in Japanese at foreign univ, or BJT≥480 (+15)
  jlptN2orBJT400: boolean       // #7: JLPT N2 or BJT≥400 (+10) — excluded if #5 or #6 counted

  growthField: boolean          // #8: Advanced project in MOJ-recognized growth field (+10)
  designatedUniv: boolean       // #9: Graduate of MOJ-designated university (+10)
  //   Qualifying lists: QS/THE/ARWU top 300, MEXT Super Global Univ, MOFA Innovative Asia partner
  designatedTraining: boolean   // #10: Completed a designated training programme (+5)
  financialSector: boolean      // #11: Work in investment management / financial sector (+10) [b/c only]
  selfInvestment: boolean       // #12: Self-invested ≥¥100M in own business (+5) [c only]
}

export interface ScoreBreakdown {
  label: string
  points: number
}

export interface ScoreResult {
  total: number
  breakdown: ScoreBreakdown[]
  status: 'gate_fail' | 'ineligible' | 'eligible_3yr' | 'eligible_1yr'
  statusLabel: string
  gateFailed: boolean
  gateMessage: string | null
}

// ── Section 1: Academic background ──────────────────────────────────────────

const DEGREE_POINTS: Record<Category, Record<DegreeType, number>> = {
  academic:  { none: 0, bachelor: 10, master: 20, mba_mot: 20, doctor: 30 },
  technical: { none: 0, bachelor: 10, master: 20, mba_mot: 25, doctor: 30 },
  business:  { none: 0, bachelor: 10, master: 20, mba_mot: 25, doctor: 20 },
  // (c) note: MBA/MOT (25) scores higher than Doctorate (20) in business management
}

function degreePoints(degree: DegreeType, dual: boolean, cat: Category): number {
  return DEGREE_POINTS[cat][degree] + (dual ? 5 : 0)
}

// ── Section 2: Professional career ──────────────────────────────────────────

function careerPoints(years: number, cat: Category): number {
  if (cat === 'academic') {
    if (years >= 7) return 15
    if (years >= 5) return 10
    if (years >= 3) return 5
    return 0
  }
  if (cat === 'technical') {
    if (years >= 10) return 20
    if (years >= 7) return 15
    if (years >= 5) return 10
    if (years >= 3) return 5
    return 0
  }
  // business
  if (years >= 10) return 25
  if (years >= 7) return 20
  if (years >= 5) return 15
  if (years >= 3) return 10
  return 0
}

// ── Section 3: Annual salary (category c flat table) ────────────────────────

function businessSalaryPoints(salary: number): number {
  if (salary >= 30_000_000) return 50
  if (salary >= 25_000_000) return 40
  if (salary >= 20_000_000) return 30
  if (salary >= 15_000_000) return 20
  if (salary >= 10_000_000) return 10
  return 0
}

// ── Section 4: Shared salary × age matrix (categories a and b) ──────────────
// Rows = salary bands (index 0 = highest), Cols = age brackets [<30, 30–34, 35–39, 40+]

const SALARY_AGE_MATRIX = [
  //        <30   30–34  35–39  40+
  [40,  40,  40,  40],  // ≥¥10 M
  [35,  35,  35,  35],  // ¥9–10 M
  [30,  30,  30,  30],  // ¥8–9 M
  [25,  25,  25,   0],  // ¥7–8 M
  [20,  20,  20,   0],  // ¥6–7 M
  [15,  15,   0,   0],  // ¥5–6 M
  [10,   0,   0,   0],  // ¥4–5 M
  [ 0,   0,   0,   0],  // ¥3–4 M
  [ 0,   0,   0,   0],  // < ¥3 M  (gate fails for b; no pts for a either)
] as const

function matrixSalaryPoints(salary: number, age: number): number {
  const ageIdx = age < 30 ? 0 : age < 35 ? 1 : age < 40 ? 2 : 3
  let sIdx: number
  if (salary >= 10_000_000)     sIdx = 0
  else if (salary >= 9_000_000) sIdx = 1
  else if (salary >= 8_000_000) sIdx = 2
  else if (salary >= 7_000_000) sIdx = 3
  else if (salary >= 6_000_000) sIdx = 4
  else if (salary >= 5_000_000) sIdx = 5
  else if (salary >= 4_000_000) sIdx = 6
  else if (salary >= 3_000_000) sIdx = 7
  else                           sIdx = 8
  return SALARY_AGE_MATRIX[sIdx][ageIdx]
}

// Age is scored separately from the salary matrix for categories (a) and (b)
function agePoints(age: number): number {
  if (age < 30) return 15
  if (age < 35) return 10
  if (age < 40) return 5
  return 0
}

// ── Section 5: Research achievements (categories a and b only) ───────────────
// 4 qualifying items: patent inventor, govt-endorsed research, published papers, research award

function countResearchItems(f: FormValues): number {
  return (f.patentInventor ? 1 : 0) +
         (f.govtResearch   ? 1 : 0) +
         (f.publishedPapers ? 1 : 0) +
         (f.researchAward  ? 1 : 0)
}

function researchPoints(f: FormValues): number {
  if (f.category === 'business') return 0
  const n = countResearchItems(f)
  if (f.category === 'academic') {
    // (a): 2+ qualifying items = 25 pts; 1 item = 20 pts
    if (n >= 2) return 25
    if (n >= 1) return 20
    return 0
  }
  // (b): any 1 qualifying item = 15 pts (flat)
  return n >= 1 ? 15 : 0
}

// ── Category (b) qualifications ─────────────────────────────────────────────
// Scoring: any one category at 2+, OR two distinct categories at 1+ = 10 pts
//          only one item in any category = 5 pts

function qualificationPoints(nat: number, exam: number, cert: number): number {
  if (nat >= 2 || exam >= 2 || cert >= 2) return 10
  const distinct = (nat >= 1 ? 1 : 0) + (exam >= 1 ? 1 : 0) + (cert >= 1 ? 1 : 0)
  if (distinct >= 2) return 10
  if (distinct >= 1) return 5
  return 0
}

// ── Category (c) position ───────────────────────────────────────────────────

function positionPoints(pos: PositionType): number {
  if (pos === 'rep_director') return 10
  if (pos === 'director') return 5
  return 0
}

// ── Section 5 bonuses ───────────────────────────────────────────────────────

function computeBonuses(f: FormValues): ScoreBreakdown[] {
  const items: ScoreBreakdown[] = []

  // #1/#2 employer innovation — mutually exclusive; SME takes precedence
  if (f.employerInnovation === 'sme') {
    items.push({ label: 'Employer: SME with innovation-promotion certification (#1)', points: 20 })
  } else if (f.employerInnovation === 'non_sme') {
    items.push({ label: 'Employer: innovation-promotion certification, non-SME (#2)', points: 10 })
  }

  // #3 R&D ratio — independent of #1/#2
  if (f.smeRdRatio) {
    items.push({ label: 'Employer (SME): R&D expense ratio >3% of revenue (#3)', points: 5 })
  }

  // #4 foreign qualification/award
  if (f.foreignQualBonus) {
    items.push({ label: 'Foreign qualification / award contributing to innovation (#4)', points: 5 })
  }

  // #5 Japanese university — mutually exclusive with #7 only
  if (f.japaneseUniv) {
    items.push({ label: 'Graduate of Japanese university (#5)', points: 10 })
  }

  // #6 JLPT N1 / majored in Japanese / BJT≥480 — mutually exclusive with #7 only
  if (f.jlptN1orBJT480) {
    items.push({ label: 'JLPT N1 / majored in Japanese (foreign univ) / BJT ≥480 (#6)', points: 15 })
  }

  // #7 JLPT N2 / BJT≥400 — excluded if #5 or #6 is counted
  if (f.jlptN2orBJT400 && !f.japaneseUniv && !f.jlptN1orBJT480) {
    items.push({ label: 'JLPT N2 / BJT ≥400 (#7)', points: 10 })
  }

  // #8 growth field
  if (f.growthField) {
    items.push({ label: 'Advanced project in MOJ-recognized growth field (#8)', points: 10 })
  }

  // #9 MOJ-designated top university
  if (f.designatedUniv) {
    items.push({ label: 'Graduate of MOJ-designated university — QS/THE/ARWU top-300, MEXT SGU, or MOFA Innovative Asia (#9)', points: 10 })
  }

  // #10 designated training programme
  if (f.designatedTraining) {
    items.push({ label: 'Completed designated training programme (#10)', points: 5 })
  }

  // #11 financial / investment management sector — categories (b) and (c) only
  if (f.financialSector && f.category !== 'academic') {
    items.push({ label: 'Investment management / financial sector work experience in Japan (#11)', points: 10 })
  }

  // #12 self-investment ≥¥100M — category (c) only
  if (f.selfInvestment && f.category === 'business') {
    items.push({ label: 'Self-investment ≥¥100,000,000 in own business (#12)', points: 5 })
  }

  return items
}

// ── Main entry point ─────────────────────────────────────────────────────────

export function calculateScore(f: FormValues): ScoreResult {
  const breakdown: ScoreBreakdown[] = []

  // Salary eligibility gate — categories (b) and (c)
  const gateFailed =
    f.category !== 'academic' && f.annualSalaryJPY > 0 && f.annualSalaryJPY < 3_000_000
  const gateMessage = gateFailed
    ? 'Annual salary must be ≥¥3,000,000 for this category (eligibility gate, not a points item).'
    : null

  // 1. Academic background
  breakdown.push({
    label: 'Academic background',
    points: degreePoints(f.degree, f.dualDegree, f.category),
  })

  // 2. Professional career
  breakdown.push({ label: 'Professional career', points: careerPoints(f.careerYears, f.category) })

  // 3. Annual salary + age
  if (f.category === 'business') {
    breakdown.push({ label: 'Annual salary', points: businessSalaryPoints(f.annualSalaryJPY) })
    // category (c) has no age scoring
  } else {
    // (a) and (b): use shared salary×age matrix, then add age points separately
    breakdown.push({
      label: 'Annual salary (age-adjusted matrix)',
      points: matrixSalaryPoints(f.annualSalaryJPY, f.age),
    })
    breakdown.push({ label: 'Age', points: agePoints(f.age) })
  }

  // 4. Research achievements — categories (a) and (b) only
  if (f.category !== 'business') {
    breakdown.push({ label: 'Research achievements', points: researchPoints(f) })
  }

  // 5. Qualifications — category (b) only
  if (f.category === 'technical') {
    const qPts = qualificationPoints(f.nationalQuals, f.itExams, f.itCerts)
    if (qPts > 0 || f.nationalQuals > 0 || f.itExams > 0 || f.itCerts > 0) {
      breakdown.push({ label: 'Japanese qualifications (national / IT)', points: qPts })
    }
  }

  // 6. Position — category (c) only
  if (f.category === 'business' && f.position !== 'none') {
    breakdown.push({ label: 'Position / role', points: positionPoints(f.position) })
  }

  // 7. Special addition bonuses
  breakdown.push(...computeBonuses(f))

  const total = breakdown.reduce((sum, b) => sum + b.points, 0)

  let status: ScoreResult['status']
  let statusLabel: string

  if (gateFailed) {
    status = 'gate_fail'
    statusLabel = 'Salary below ¥3,000,000 minimum — not eligible for this category'
  } else if (total >= 80) {
    status = 'eligible_1yr'
    statusLabel = '80+ pts — Fast-track PR eligible after 1 year of HSP residence'
  } else if (total >= 70) {
    status = 'eligible_3yr'
    statusLabel = '70+ pts — PR eligible after 3 years of HSP residence'
  } else {
    const need = 70 - total
    statusLabel = `${total} pts — need ${need} more to reach the 70-pt threshold`
    status = 'ineligible'
  }

  return { total, breakdown, status, statusLabel, gateFailed, gateMessage }
}
