// ========================================
// Sekai Master DB API
// ========================================

// API 端點配置 - 優先順序
const API_ENDPOINTS = [
  'https://sekai-world.github.io/sekai-master-db-tc-diff',
  'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-tc-diff/main',
]

const JP_API_ENDPOINTS = [
  'https://sekai-world.github.io/sekai-master-db-diff',
  'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main',
]

// 圖片 CDN
const IMAGE_CDN = 'https://storage.sekai.best/sekai-jp-assets'

// Cache for API responses
const cache: Map<string, { data: unknown; timestamp: number }> = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// 嘗試多個端點
async function fetchWithFallback<T>(endpoints: string[], path: string): Promise<T> {
  const cacheKey = path
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }

  let lastError: Error | null = null
  
  for (const baseUrl of endpoints) {
    try {
      const url = `${baseUrl}/${path}`
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        cache.set(cacheKey, { data, timestamp: Date.now() })
        return data as T
      }
    } catch (error) {
      lastError = error as Error
      console.warn(`Failed to fetch from ${baseUrl}/${path}:`, error)
    }
  }
  
  throw lastError || new Error(`Failed to fetch ${path} from all endpoints`)
}

// 簡化的 fetch 函數
async function fetchData<T>(path: string, useJP: boolean = false): Promise<T> {
  const endpoints = useJP ? JP_API_ENDPOINTS : API_ENDPOINTS
  return fetchWithFallback<T>(endpoints, path)
}

// ========================================
// Cards API
// ========================================

export async function fetchCards() {
  try {
    return await fetchData<any[]>('cards.json')
  } catch {
    return []
  }
}

export async function fetchCardRarities() {
  try {
    return await fetchData<any[]>('cardRarities.json')
  } catch {
    return []
  }
}

export async function fetchSkills() {
  try {
    return await fetchData<any[]>('skills.json')
  } catch {
    return []
  }
}

export async function fetchCardParameters() {
  try {
    return await fetchData<any[]>('cardParameters.json')
  } catch {
    return []
  }
}

// ========================================
// Area Items API
// ========================================

export async function fetchAreaItems() {
  try {
    return await fetchData<any[]>('areaItems.json')
  } catch {
    return []
  }
}

export async function fetchAreaItemLevels() {
  try {
    return await fetchData<any[]>('areaItemLevels.json')
  } catch {
    return []
  }
}

// ========================================
// MySEKAI API
// ========================================

export async function fetchMysekaiGates() {
  try {
    return await fetchData<any[]>('mysekaiGates.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiGateLevels() {
  try {
    return await fetchData<any[]>('mysekaiGateLevels.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiGateLevelMaterialCosts() {
  try {
    return await fetchData<any[]>('mysekaiGateLevelMaterialCosts.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiFixtures() {
  try {
    return await fetchData<any[]>('mysekaiFixtures.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiFixtureMainGenres() {
  try {
    return await fetchData<any[]>('mysekaiFixtureMainGenres.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiFixtureSubGenres() {
  try {
    return await fetchData<any[]>('mysekaiFixtureSubGenres.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiFixtureTags() {
  try {
    return await fetchData<any[]>('mysekaiFixtureTags.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiGateBlueprints() {
  try {
    return await fetchData<any[]>('mysekaiGateBlueprints.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiFixtureBlueprints() {
  try {
    return await fetchData<any[]>('mysekaiFixtureBlueprints.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiFixtureBlueprintMaterialCosts() {
  try {
    return await fetchData<any[]>('mysekaiFixtureBlueprintMaterialCosts.json')
  } catch {
    return []
  }
}

export async function fetchMysekaiMaterials() {
  try {
    return await fetchData<any[]>('mysekaiMaterials.json')
  } catch {
    return []
  }
}

// ========================================
// Music API
// ========================================

export async function fetchMusics() {
  try {
    return await fetchData<any[]>('musics.json')
  } catch {
    return []
  }
}

export async function fetchMusicDifficulties() {
  try {
    return await fetchData<any[]>('musicDifficulties.json')
  } catch {
    return []
  }
}

export async function fetchMusicTags() {
  try {
    return await fetchData<any[]>('musicTags.json')
  } catch {
    return []
  }
}

// ========================================
// Gacha API
// ========================================

export async function fetchGachas() {
  try {
    return await fetchData<any[]>('gachas.json')
  } catch {
    return []
  }
}

export async function fetchGachaCards() {
  try {
    return await fetchData<any[]>('gachaCards.json')
  } catch {
    return []
  }
}

export async function fetchGachaCardWeights() {
  try {
    return await fetchData<any[]>('gachaCardRarityRates.json')
  } catch {
    return []
  }
}

// 別名
export const fetchGachaCardRarityRates = fetchGachaCardWeights

// ========================================
// Canvas Bonus API
// ========================================

export async function fetchCardMysekaiCanvasBonuses() {
  try {
    return await fetchData<any[]>('cardMysekaiCanvasBonuses.json')
  } catch {
    return []
  }
}

// ========================================
// Events API
// ========================================

export async function fetchEvents() {
  try {
    return await fetchData<any[]>('events.json')
  } catch {
    return []
  }
}

export async function fetchEventCards() {
  try {
    return await fetchData<any[]>('eventCards.json')
  } catch {
    return []
  }
}

export async function fetchEventDeckBonuses() {
  try {
    return await fetchData<any[]>('eventDeckBonuses.json')
  } catch {
    return []
  }
}

// ========================================
// Live Event Tracker API (HiSekai)
// ========================================

const HISEKAI_API = 'https://api.hisekai.org'

export async function fetchLiveEventRanking() {
  try {
    const response = await fetch(`${HISEKAI_API}/event/live/top100`)
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export async function fetchEventHistory(eventId: number) {
  try {
    const response = await fetch(`${HISEKAI_API}/event/${eventId}/top100`)
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export async function fetchEventList() {
  try {
    const response = await fetch(`${HISEKAI_API}/event/list`)
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

// ========================================
// Image URL Helper Functions
// ========================================

export function getCardImageUrl(assetbundleName: string, type: 'normal' | 'after_training' = 'normal') {
  const suffix = type === 'after_training' ? 'after_training' : 'normal'
  return `${IMAGE_CDN}/character/member/${assetbundleName}/card_${suffix}.webp`
}

export function getCardThumbnailUrl(assetbundleName: string, type: 'normal' | 'after_training' = 'normal') {
  const suffix = type === 'after_training' ? 'after_training' : 'normal'
  return `${IMAGE_CDN}/thumbnail/chara/${assetbundleName}_${suffix}.webp`
}

export function getCharacterIconUrl(characterId: number) {
  const id = characterId.toString().padStart(2, '0')
  return `${IMAGE_CDN}/character/character2d/chara_${id}/icon.webp`
}

export function getUnitLogoUrl(unit: string) {
  return `${IMAGE_CDN}/unit_logo/${unit}_logo/${unit}_logo.webp`
}

export function getMusicJacketUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/music/jacket/${assetbundleName}/${assetbundleName}.webp`
}

export function getMusicVocalUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/music/long/${assetbundleName}/${assetbundleName}.mp3`
}

export function getEventBannerUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/event/${assetbundleName}/logo/logo.webp`
}

export function getEventBackgroundUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/event/${assetbundleName}/screen/background.webp`
}

export function getGachaBannerUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/gacha/${assetbundleName}/logo/logo.webp`
}

export function getStampImageUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/stamp/${assetbundleName}/${assetbundleName}.webp`
}

export function getMysekaiMaterialUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/mysekai/material/${assetbundleName}/${assetbundleName}.webp`
}

// 別名
export const getMysekaiMaterialImageUrl = getMysekaiMaterialUrl

export function getMysekaiGateUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/mysekai/gate/${assetbundleName}/${assetbundleName}.webp`
}

// 別名
export const getMysekaiGateImageUrl = getMysekaiGateUrl

export function getMysekaiDollUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/mysekai/doll/${assetbundleName}/${assetbundleName}.webp`
}

export function getMysekaiFurnitureUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/mysekai/fixture/${assetbundleName}/${assetbundleName}.webp`
}

// 別名
export const getMysekaiFixtureImageUrl = getMysekaiFurnitureUrl

export function getMysekaiAreaUrl(assetbundleName: string) {
  return `${IMAGE_CDN}/mysekai/area/${assetbundleName}/${assetbundleName}.webp`
}

// ========================================
// Stamps API
// ========================================

export async function fetchStamps() {
  try {
    return await fetchData<any[]>('stamps.json')
  } catch {
    return []
  }
}

export async function fetchGameCharacters() {
  try {
    return await fetchData<any[]>('gameCharacters.json')
  } catch {
    return []
  }
}

export async function fetchGameCharacterUnits() {
  try {
    return await fetchData<any[]>('gameCharacterUnits.json')
  } catch {
    return []
  }
}

export async function fetchCharacterProfiles() {
  try {
    return await fetchData<any[]>('characterProfiles.json')
  } catch {
    return []
  }
}

// ========================================
// Music Vocals API
// ========================================

export async function fetchMusicVocals() {
  try {
    return await fetchData<any[]>('musicVocals.json')
  } catch {
    return []
  }
}

export async function fetchOutsideCharacters() {
  try {
    return await fetchData<any[]>('outsideCharacters.json')
  } catch {
    return []
  }
}

// ========================================
// Honor API
// ========================================

export async function fetchHonors() {
  try {
    return await fetchData<any[]>('honors.json')
  } catch {
    return []
  }
}

export async function fetchHonorGroups() {
  try {
    return await fetchData<any[]>('honorGroups.json')
  } catch {
    return []
  }
}

// ========================================
// Character Ranks API
// ========================================

export async function fetchCharacterRanks() {
  try {
    return await fetchData<any[]>('characterRanks.json')
  } catch {
    return []
  }
}

// ========================================
// Bonds API
// ========================================

export async function fetchBonds() {
  try {
    return await fetchData<any[]>('bonds.json')
  } catch {
    return []
  }
}

export async function fetchBondsHonors() {
  try {
    return await fetchData<any[]>('bondsHonors.json')
  } catch {
    return []
  }
}

export async function fetchBondsHonorWords() {
  try {
    return await fetchData<any[]>('bondsHonorWords.json')
  } catch {
    return []
  }
}
