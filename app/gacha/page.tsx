'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGachas, fetchCards, getCardThumbnailUrl, getGachaBannerUrl } from '@/lib/api'
import { CHARACTER_NAMES_TW } from '@/lib/types'

interface Gacha {
  id: number
  gachaType: string
  name: string
  assetbundleName: string
  startAt: number
  endAt: number
}

interface Card {
  id: number
  characterId: number
  cardRarityType: string
  prefix: string
  assetbundleName: string
}

interface GachaResult {
  card: Card
  isNew: boolean
}

const RARITY_RATES = {
  rarity_4: 0.03,
  rarity_3: 0.085,
  rarity_2: 0.885,
}

const RARITY_COLORS: Record<string, string> = {
  rarity_4: 'from-yellow-400 to-amber-500',
  rarity_3: 'from-purple-400 to-pink-500',
  rarity_2: 'from-blue-400 to-cyan-500',
  rarity_birthday: 'from-pink-400 to-rose-500',
}

const RARITY_NAMES: Record<string, string> = {
  rarity_4: '★4',
  rarity_3: '★3',
  rarity_2: '★2',
  rarity_birthday: '★BD',
}

export default function GachaSimulatorPage() {
  const [allGachas, setAllGachas] = useState<Gacha[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGacha, setSelectedGacha] = useState<Gacha | null>(null)
  const [results, setResults] = useState<GachaResult[]>([])
  const [totalPulls, setTotalPulls] = useState(0)
  const [totalCrystals, setTotalCrystals] = useState(0)
  const [star4Count, setStar4Count] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function loadData() {
      try {
        const [gachaData, cardData] = await Promise.all([
          fetchGachas(),
          fetchCards()
        ])
        
        if (!gachaData || gachaData.length === 0) {
          setError('無法載入轉蛋資料')
          setLoading(false)
          return
        }

        // 過濾近6個月的卡池
        const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000)
        const recentGachas = gachaData
          .filter((g: Gacha) => 
            (g.gachaType === 'normal' || g.gachaType === 'limited' || g.gachaType === 'birthday') &&
            g.startAt > sixMonthsAgo
          )
          .sort((a: Gacha, b: Gacha) => b.startAt - a.startAt)
        
        setAllGachas(recentGachas)
        setCards(cardData?.filter((c: Card) => 
          c.cardRarityType === 'rarity_4' || 
          c.cardRarityType === 'rarity_3' || 
          c.cardRarityType === 'rarity_2'
        ) || [])
        
        if (recentGachas.length > 0) {
          setSelectedGacha(recentGachas[0])
        }
      } catch (err) {
        console.error('Error loading gacha data:', err)
        setError('載入資料時發生錯誤')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const simulatePull = useCallback((count: number) => {
    if (cards.length === 0) return

    const star4Cards = cards.filter(c => c.cardRarityType === 'rarity_4')
    const star3Cards = cards.filter(c => c.cardRarityType === 'rarity_3')
    const star2Cards = cards.filter(c => c.cardRarityType === 'rarity_2')

    if (star4Cards.length === 0 || star3Cards.length === 0 || star2Cards.length === 0) return

    const newResults: GachaResult[] = []
    let newStar4Count = 0

    for (let i = 0; i < count; i++) {
      const rand = Math.random()
      let selectedCard: Card
      
      const isGuaranteeSlot = count === 10 && i === 9 && newResults.every(r => 
        r.card.cardRarityType !== 'rarity_4' && r.card.cardRarityType !== 'rarity_3'
      )

      if (isGuaranteeSlot) {
        if (rand < RARITY_RATES.rarity_4) {
          selectedCard = star4Cards[Math.floor(Math.random() * star4Cards.length)]
          newStar4Count++
        } else {
          selectedCard = star3Cards[Math.floor(Math.random() * star3Cards.length)]
        }
      } else if (rand < RARITY_RATES.rarity_4) {
        selectedCard = star4Cards[Math.floor(Math.random() * star4Cards.length)]
        newStar4Count++
      } else if (rand < RARITY_RATES.rarity_4 + RARITY_RATES.rarity_3) {
        selectedCard = star3Cards[Math.floor(Math.random() * star3Cards.length)]
      } else {
        selectedCard = star2Cards[Math.floor(Math.random() * star2Cards.length)]
      }

      newResults.push({
        card: selectedCard,
        isNew: Math.random() > 0.7,
      })
    }

    newResults.sort((a, b) => {
      const rarityOrder: Record<string, number> = { rarity_4: 0, rarity_birthday: 1, rarity_3: 2, rarity_2: 3 }
      return (rarityOrder[a.card.cardRarityType] || 5) - (rarityOrder[b.card.cardRarityType] || 5)
    })

    setShowAnimation(true)
    setTimeout(() => {
      setResults(newResults)
      setTotalPulls(prev => prev + count)
      setTotalCrystals(prev => prev + (count === 1 ? 300 : 3000))
      setStar4Count(prev => prev + newStar4Count)
      setShowAnimation(false)
    }, 500)
  }, [cards])

  const resetStats = () => {
    setResults([])
    setTotalPulls(0)
    setTotalCrystals(0)
    setStar4Count(0)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
  }

  const handleImageError = (gachaId: number) => {
    setImageErrors(prev => new Set(prev).add(gachaId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-soft border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            重新載入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-8">
          <h1 className="heading-1 text-gradient-gold mb-4">轉蛋模擬器</h1>
          <p className="text-sekai-silver">模擬抽卡體驗，不花任何水晶！</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Gacha Selection & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Gacha List */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">選擇卡池 (近6個月)</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {allGachas.map((gacha) => (
                  <button
                    key={gacha.id}
                    onClick={() => setSelectedGacha(gacha)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedGacha?.id === gacha.id
                        ? 'border-gold-soft bg-gold-dim/10'
                        : 'border-sekai-ash/30 bg-sekai-charcoal/50 hover:border-sekai-ash'
                    }`}
                  >
                    <div className="flex gap-3">
                      {!imageErrors.has(gacha.id) ? (
                        <div className="w-16 h-8 rounded overflow-hidden bg-sekai-charcoal flex-shrink-0">
                          <img
                            src={getGachaBannerUrl(gacha.assetbundleName)}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => handleImageError(gacha.id)}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-8 rounded bg-sekai-charcoal flex items-center justify-center flex-shrink-0">
                          <span className="text-sekai-mist text-xs">✧</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${
                          selectedGacha?.id === gacha.id ? 'text-gold-soft' : 'text-sekai-pearl'
                        }`}>
                          {gacha.name}
                        </p>
                        <p className="text-xs text-sekai-mist">
                          {formatDate(gacha.startAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-sekai-mist mt-3">共 {allGachas.length} 個卡池</p>
            </div>

            {/* Pull Buttons */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">抽卡</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => simulatePull(1)}
                  disabled={showAnimation || cards.length === 0}
                  className="flex-1 btn-secondary disabled:opacity-50"
                >
                  <div className="text-lg font-bold">單抽</div>
                  <div className="text-xs text-sekai-mist">300 💎</div>
                </button>
                <button
                  onClick={() => simulatePull(10)}
                  disabled={showAnimation || cards.length === 0}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  <div className="text-lg font-bold">十連</div>
                  <div className="text-xs opacity-80">3000 💎</div>
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-3">統計</h2>
                <button
                  onClick={resetStats}
                  className="text-sm text-sekai-silver hover:text-gold-soft transition-colors"
                >
                  重置
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sekai-mist">總抽數</span>
                  <span className="text-sekai-pearl font-bold">{totalPulls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sekai-mist">消耗水晶</span>
                  <span className="text-sekai-pearl font-bold">{totalCrystals.toLocaleString()} 💎</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sekai-mist">★4 數量</span>
                  <span className="text-gold-soft font-bold">{star4Count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sekai-mist">★4 機率</span>
                  <span className={`font-bold ${
                    totalPulls > 0 && (star4Count / totalPulls) > 0.03 
                      ? 'text-green-400' 
                      : 'text-sekai-pearl'
                  }`}>
                    {totalPulls > 0 ? ((star4Count / totalPulls) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                
                {totalPulls > 0 && (
                  <div className="pt-4 border-t border-sekai-ash/30">
                    <div className="text-xs text-sekai-mist mb-2">期望值比較 (基準: 3%)</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-sekai-charcoal rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-gold-dim to-gold-soft rounded-full transition-all"
                          style={{ width: `${Math.min((star4Count / totalPulls) / 0.03 * 100, 200)}%` }}
                        />
                      </div>
                      <span className="text-xs text-sekai-silver w-12 text-right">
                        {((star4Count / totalPulls) / 0.03 * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rates Info */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">機率說明</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gold-soft">★4</span>
                  <span className="text-sekai-pearl">3.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">★3</span>
                  <span className="text-sekai-pearl">8.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">★2</span>
                  <span className="text-sekai-pearl">88.5%</span>
                </div>
                <div className="pt-2 mt-2 border-t border-sekai-ash/30 text-sekai-mist text-xs">
                  十連保底至少一張 ★3 以上
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="heading-3 mb-6">
                抽卡結果
                {selectedGacha && (
                  <span className="text-sm text-sekai-mist font-normal ml-2">
                    - {selectedGacha.name}
                  </span>
                )}
              </h2>
              
              {showAnimation ? (
                <div className="flex items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gold-dim to-gold-soft animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-sekai-void" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">✨</span>
                    </div>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map((result, index) => {
                    const rarityColor = RARITY_COLORS[result.card.cardRarityType] || RARITY_COLORS.rarity_2
                    const rarityName = RARITY_NAMES[result.card.cardRarityType] || '★?'
                    const isStar4 = result.card.cardRarityType === 'rarity_4'

                    return (
                      <div
                        key={`${result.card.id}-${index}`}
                        className={`relative rounded-xl overflow-hidden ${
                          isStar4 ? 'ring-2 ring-gold-soft shadow-lg shadow-gold-soft/20' : ''
                        }`}
                      >
                        <div className={`aspect-square bg-gradient-to-br ${rarityColor}`}>
                          <img
                            src={getCardThumbnailUrl(result.card.assetbundleName)}
                            alt={result.card.prefix || '卡片'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>

                        <div className={`absolute top-1 left-1 px-1.5 py-0.5 text-xs font-bold rounded bg-gradient-to-r ${rarityColor} text-white`}>
                          {rarityName}
                        </div>

                        {result.isNew && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 text-xs font-bold rounded bg-red-500 text-white">
                            NEW
                          </div>
                        )}

                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <div className="text-xs text-white truncate">
                            {CHARACTER_NAMES_TW[result.card.characterId] || '???'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-20 text-sekai-mist">
                  <div className="text-6xl mb-4 opacity-30">✧</div>
                  <p className="text-lg">點擊上方按鈕開始抽卡</p>
                  <p className="text-sm mt-2">模擬抽卡不會消耗任何資源</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
