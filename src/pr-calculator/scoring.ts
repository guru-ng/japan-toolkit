// TODO: verify against ISA (Immigration Services Agency) official scoring tables before using this
// for real immigration advice. Official source:
//   https://www.isa.go.jp/en/publications/materials/nyuukokukanri07_00149.html
// The values below are approximate scaffolding based on publicly available summaries.
// Replace each section marked [VERIFY] with confirmed official values.

export type Category = 'academic' | 'technical' | 'business'

export interface FormValues {
  category: Category

  // Academic background [VERIFY]
  academicDegree: 'none' | 'bachelor' | 'master' | 'doctor'
  dualDegree: boolean           // +5 for holding 2+ university degrees

  // Career [VERIFY]
  careerYears: number           // years of relevant professional experience

  // Salary (annual, JPY) [VERIFY]
  annualSalaryJPY: number

  // Age [VERIFY]
  age: number

  // Japanese language [VERIFY]
  japaneseLevel: 'none' | 'jlpt_n2' | 'jlpt_n1' | 'bjt_480'

  // Research / achievements (academic & technical categories only) [VERIFY]
  patents: number               // number of patents (each contributes points up to a cap)
  publications: number          // peer-reviewed papers
  conductedResearch: boolean    // led research that resulted in public funding / commendations

  // Business management specific [VERIFY]
  investmentAmount: boolean     // invested 100M+ JPY in Japan

  // Bonus items [VERIFY]
  graduatedJapaneseUniv: boolean
  workedInJapan: boolean        // 10+ years continuous employment in Japan
  certifiedSME: boolean         // SME management related certification
  growthFieldBonus: boolean     // working in specified growth fields (digital, green, etc.)
}

export interface ScoreBreakdown {
  label: string
  points: number
}

export interface ScoreResult {
  total: number
  breakdown: ScoreBreakdown[]
  status: 'ineligible' | 'eligible_3yr' | 'eligible_1yr'
  statusLabel: string
}

function academicPoints(degree: FormValues['academicDegree'], dual: boolean): number {
  // [VERIFY] These are approximate scaffold values
  const base: Record<FormValues['academicDegree'], number> = {
    none: 0,
    bachelor: 10,
    master: 20,
    doctor: 30,
  }
  return base[degree] + (dual ? 5 : 0)
}

function careerPoints(years: number, _category: Category): number {
  // [VERIFY]
  if (years >= 10) return 20
  if (years >= 7) return 15
  if (years >= 5) return 10
  if (years >= 3) return 5
  return 0
}

function salaryPoints(salary: number, _category: Category): number {
  // [VERIFY] Approximate salary bands (JPY)
  if (salary >= 10_000_000) return 40
  if (salary >= 9_000_000) return 35
  if (salary >= 8_000_000) return 30
  if (salary >= 7_000_000) return 25
  if (salary >= 6_000_000) return 20
  if (salary >= 5_000_000) return 15
  if (salary >= 4_000_000) return 10
  if (salary >= 3_000_000) return 5
  return 0
}

function agePoints(age: number): number {
  // [VERIFY]
  if (age < 30) return 15
  if (age < 35) return 10
  if (age < 40) return 5
  return 0
}

function languagePoints(level: FormValues['japaneseLevel']): number {
  // [VERIFY]
  switch (level) {
    case 'jlpt_n1': return 15
    case 'jlpt_n2': return 10
    case 'bjt_480': return 10
    default: return 0
  }
}

function researchPoints(f: FormValues): number {
  if (f.category === 'business') return 0
  let pts = 0
  // [VERIFY] Patent & publication scoring
  if (f.patents >= 3) pts += 20
  else if (f.patents >= 1) pts += 15
  if (f.publications >= 3) pts += 20
  else if (f.publications >= 1) pts += 10
  if (f.conductedResearch) pts += 15
  return pts
}

function bonusPoints(f: FormValues): ScoreBreakdown[] {
  const bonuses: ScoreBreakdown[] = []
  // [VERIFY]
  if (f.graduatedJapaneseUniv) bonuses.push({ label: 'Graduated Japanese university', points: 10 })
  if (f.workedInJapan) bonuses.push({ label: '10+ years Japan work history', points: 10 })
  if (f.certifiedSME) bonuses.push({ label: 'SME management certification', points: 10 })
  if (f.growthFieldBonus) bonuses.push({ label: 'Growth field (digital/green)', points: 10 })
  if (f.investmentAmount && f.category === 'business') {
    bonuses.push({ label: '100M+ JPY investment in Japan', points: 10 })
  }
  return bonuses
}

export function calculateScore(f: FormValues): ScoreResult {
  const breakdown: ScoreBreakdown[] = []

  const academic = academicPoints(f.academicDegree, f.dualDegree)
  breakdown.push({ label: 'Academic background', points: academic })

  const career = careerPoints(f.careerYears, f.category)
  breakdown.push({ label: 'Professional career', points: career })

  const salary = salaryPoints(f.annualSalaryJPY, f.category)
  breakdown.push({ label: 'Annual salary', points: salary })

  const age = agePoints(f.age)
  breakdown.push({ label: 'Age', points: age })

  const lang = languagePoints(f.japaneseLevel)
  if (lang > 0) breakdown.push({ label: 'Japanese language', points: lang })

  const research = researchPoints(f)
  if (research > 0) breakdown.push({ label: 'Research achievements', points: research })

  const bonuses = bonusPoints(f)
  breakdown.push(...bonuses)

  const total = breakdown.reduce((sum, b) => sum + b.points, 0)

  let status: ScoreResult['status']
  let statusLabel: string

  if (total >= 80) {
    status = 'eligible_1yr'
    statusLabel = '80+ points — Fast-track PR eligible after 1 year'
  } else if (total >= 70) {
    status = 'eligible_3yr'
    statusLabel = '70+ points — PR eligible after 3 years'
  } else {
    status = 'ineligible'
    statusLabel = `${total} / 70 points needed — Not yet eligible`
  }

  return { total, breakdown, status, statusLabel }
}
