export interface ZipResult {
  address1: string  // prefecture (Japanese)
  address2: string  // city (Japanese)
  address3: string  // town/area (Japanese)
  kana1: string
  kana2: string
  kana3: string
  prefcode: string
  zipcode: string
}

interface ZipCloudResponse {
  message: string | null
  results: ZipResult[] | null
  status: number
}

const ENDPOINT = 'https://zipcloud.ibsnet.co.jp/api/search'

export type LookupResult =
  | { ok: true; results: ZipResult[] }
  | { ok: false; error: string }

export async function lookupPostalCode(rawCode: string): Promise<LookupResult> {
  const zipcode = rawCode.replace(/[^0-9]/g, '')

  if (zipcode.length !== 7) {
    return { ok: false, error: 'Postal code must be 7 digits (e.g. 1234567 or 123-4567).' }
  }

  let data: ZipCloudResponse
  try {
    const url = `${ENDPOINT}?zipcode=${zipcode}`
    const res = await fetch(url)
    if (!res.ok) {
      return { ok: false, error: `Network error: HTTP ${res.status}` }
    }
    data = (await res.json()) as ZipCloudResponse
  } catch {
    return { ok: false, error: 'Could not reach the ZipCloud API. Check your connection.' }
  }

  if (data.status !== 200) {
    return { ok: false, error: data.message ?? 'API returned an error.' }
  }

  if (data.results == null || data.results.length === 0) {
    return { ok: false, error: `No address found for postal code ${zipcode}.` }
  }

  return { ok: true, results: data.results }
}
