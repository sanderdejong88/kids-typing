import { readJson, writeJson } from './storage'

// Certificates at 75 and 100 apm and the diploma at 120 (REQUIREMENTS D3), by level in apm
export type Certificate = { apm: number; accuracy: number; date: string }
export type Certificates = Record<number, Certificate>

const CERTIFICATES = 'typen-maar:certificates'
const NAME = 'typen-maar:name'
const BALLOONS = 'typen-maar:balloons'

export const loadCertificates = () => readJson<Certificates>(CERTIFICATES, {})
export const saveCertificates = (certificates: Certificates) => writeJson(CERTIFICATES, certificates)

// Her name, for on the certificate
export const loadName = () => readJson(NAME, '')
export const saveName = (name: string) => writeJson(NAME, name)

// Her best score in the balloon game
export const loadBalloonRecord = () => readJson(BALLOONS, 0)
export const saveBalloonRecord = (score: number) => writeJson(BALLOONS, score)

// The diploma names a band, like the Dutch diplomas do: 120, 150 or 175+ apm
export function band(apm: number): number {
  return apm >= 175 ? 175 : apm >= 150 ? 150 : 120
}

// A certificate is replaced only by a faster result
export function award(certificates: Certificates, level: number, result: Certificate): Certificates {
  const old = certificates[level]
  return old && old.apm >= result.apm ? certificates : { ...certificates, [level]: result }
}
