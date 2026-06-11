export interface Era {
  romaji: string
  kanji: string
  // First day of the era in Gregorian (UTC midnight)
  start: Date
  // Last day of the era in Gregorian (UTC midnight), undefined = still current
  end?: Date
}

// Era boundaries sourced from Japanese government records.
// Dates are the first day each era began (the previous day belongs to the prior era).
export const ERAS: readonly Era[] = [
  {
    romaji: 'Meiji',
    kanji: '明治',
    start: new Date('1868-01-25'),
    end: new Date('1912-07-29'),
  },
  {
    romaji: 'Taisho',
    kanji: '大正',
    start: new Date('1912-07-30'),
    end: new Date('1926-12-24'),
  },
  {
    romaji: 'Showa',
    kanji: '昭和',
    start: new Date('1926-12-25'),
    end: new Date('1989-01-07'),
  },
  {
    romaji: 'Heisei',
    kanji: '平成',
    start: new Date('1989-01-08'),
    end: new Date('2019-04-30'),
  },
  {
    romaji: 'Reiwa',
    kanji: '令和',
    start: new Date('2019-05-01'),
  },
]

export interface GregorianDate {
  year: number
  month: number // 1-indexed
  day: number
}

export interface JapaneseEraDate {
  era: Era
  year: number // e.g., Reiwa 6 → year = 6
  month: number // 1-indexed
  day: number
}

export type ConversionResult<T> = { ok: true; value: T } | { ok: false; error: string }

function toUTCMidnight(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

function isValidGregorian(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) return false
  const d = toUTCMidnight(year, month, day)
  // Verify no calendar overflow (e.g., Feb 30)
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() + 1 === month &&
    d.getUTCDate() === day
  )
}

export function gregorianToEra(
  g: GregorianDate,
): ConversionResult<JapaneseEraDate> {
  const { year, month, day } = g

  if (!isValidGregorian(year, month, day)) {
    return { ok: false, error: 'Invalid Gregorian date.' }
  }

  const target = toUTCMidnight(year, month, day)

  const era = ERAS.find((e) => {
    const afterStart = target >= e.start
    const beforeEnd = e.end == null || target <= e.end
    return afterStart && beforeEnd
  })

  if (era == null) {
    return {
      ok: false,
      error: `Date is outside supported era range (${ERAS[0].romaji} ${ERAS[0].start.getUTCFullYear()} – present).`,
    }
  }

  const eraYear = year - era.start.getUTCFullYear() + 1
  return { ok: true, value: { era, year: eraYear, month, day } }
}

export function eraToGregorian(
  eraRomaji: string,
  eraYear: number,
  month: number,
  day: number,
): ConversionResult<GregorianDate> {
  const era = ERAS.find((e) => e.romaji === eraRomaji)
  if (era == null) {
    return { ok: false, error: `Unknown era: ${eraRomaji}` }
  }
  if (eraYear < 1) {
    return { ok: false, error: 'Era year must be 1 or greater.' }
  }

  const gregorianYear = era.start.getUTCFullYear() + eraYear - 1

  if (!isValidGregorian(gregorianYear, month, day)) {
    return { ok: false, error: 'Invalid date for the given era and year.' }
  }

  const target = toUTCMidnight(gregorianYear, month, day)

  // Verify the resulting Gregorian date is still within the era's boundaries
  if (target < era.start) {
    return {
      ok: false,
      error: `${era.romaji} 1 starts on ${formatGregorian(era.start)} — the date you entered falls before it.`,
    }
  }
  if (era.end != null && target > era.end) {
    const maxEraYear = era.end.getUTCFullYear() - era.start.getUTCFullYear() + 1
    return {
      ok: false,
      error: `${era.romaji} ended at year ${maxEraYear}. The last day was ${formatGregorian(era.end)}.`,
    }
  }

  return { ok: true, value: { year: gregorianYear, month, day } }
}

export function formatGregorian(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatEraDate(j: JapaneseEraDate): string {
  const m = String(j.month).padStart(2, '0')
  const d = String(j.day).padStart(2, '0')
  return `${j.era.kanji}${j.year}年${m}月${d}日 (${j.era.romaji} ${j.year}, ${j.month}/${j.day})`
}

// Cross-check using Intl.DateTimeFormat with Japanese calendar as a sanity check.
// Returns null if Intl doesn't support the Japanese calendar on this platform.
export function intlCrossCheck(g: GregorianDate): string | null {
  try {
    const d = new Date(Date.UTC(g.year, g.month - 1, g.day))
    const fmt = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {
      era: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC',
    })
    return fmt.format(d)
  } catch {
    return null
  }
}
