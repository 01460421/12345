'use client'

import { useState, useEffect } from 'react'
import { fetchCards, fetchSkills, getCardImageUrl, getCardThumbnailUrl } from '@/lib/api'
import { CHARACTER_NAMES_TW, UNIT_NAMES_TW, ATTRIBUTE_NAMES_TW, CHARACTER_UNIT, type UnitId, type Attribute } from '@/lib/types'

interface CardData {
  id: number
  characterId: number
  cardRarityType: string
  attr: Attribute
  prefix: string
  assetbundleName: string
  releaseAt: number
  skillId: number
  cardSkillName: string
  gachaPhrase: string
  flavorText: string
  specialTrainingPower1BonusFixed: number
  specialTrainingPower2BonusFixed: number
  specialTrainingPower3BonusFixed: number
  supportUnit?: string
}

interface SkillData {
  id: number
  description: string
  skillEffects: Array<{
    skillEffectType: string
    activateNotesJudgmentType: string
    skillEffectDetails: Array<{
      level: number
      activateEffectDuration: number
      activateEffectValue: number
      activateEffectValueType: string
    }>
  }>
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardData[]>([])
  const [skills, setSkills] = useState<SkillData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [showAfterTraining, setShowAfterTraining] = useState(false)
  const [filters, setFilters] = useState({
    character: 0,
    rarity: '',
    attribute: '',
    search: '',
    unit: '',
  })

  useEffect(() => {
    Promise.all([fetchCards(), fetchSkills()])
      .then(([cardsData, skillsData]) => {
        setCards(cardsData)
        setSkills(skillsData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch data:', err)
        setLoading(false)
      })
  }, [])

  const filteredCards = cards.filter((card) => {
    if (filters.character && card.characterId !== filters.character) return false
    if (filters.rarity && card.cardRarityType !== filters.rarity) return false
    if (filters.attribute && card.attr !== filters.attribute) return false
    if (filters.unit && CHARACTER_UNIT[card.characterId] !== filters.unit) return false
    if (filters.search && !card.prefix?.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const getRarityStars = (rarity: string) => {
    switch (rarity) {
      case 'rarity_1': return '★'
      case 'rarity_2': return '★★'
      case 'rarity_3': return '★★★'
      case 'rarity_4': return '★★★★'
      case 'rarity_birthday': return '🎂'
      default: return rarity
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rarity_4': return 'text-yellow-400'
      case 'rarity_3': return 'text-purple-400'
      case 'rarity_2': return 'text-blue-400'
      case 'rarity_1': return 'text-gray-400'
      case 'rarity_birthday': return 'text-pink-400'
      default: return 'text-sekai-silver'
    }
  }

  const getAttributeColor = (attr: Attribute) => {
    const colors: Record<Attribute, string> = {
      cute: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      cool: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pure: 'bg-green-500/20 text-green-400 border-green-500/30',
      happy: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      mysterious: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    }
    return colors[attr] || 'bg-sekai-charcoal text-sekai-silver border-sekai-ash'
  }

  const getUnitColor = (characterId: number): string => {
    const unit = CHARACTER_UNIT[characterId]
    if (!unit) return 'border-sekai-ash'
    const colors: Record<UnitId, string> = {
      ln: 'border-unit-ln/50',
      mmj: 'border-unit-mmj/50',
      vbs: 'border-unit-vbs/50',
      wxs: 'border-unit-wxs/50',
      niigo: 'border-unit-niigo/50',
      vs: 'border-unit-vs/50',
    }
    return colors[unit] || 'border-sekai-ash'
  }

  const getUnitBgColor = (characterId: number): string => {
    const unit = CHARACTER_UNIT[characterId]
    if (!unit) return 'from-sekai-charcoal to-sekai-ink'
    const colors: Record<UnitId, string> = {
      ln: 'from-unit-ln/10 to-unit-ln/5',
      mmj: 'from-unit-mmj/10 to-unit-mmj/5',
      vbs: 'from-unit-vbs/10 to-unit-vbs/5',
      wxs: 'from-unit-wxs/10 to-unit-wxs/5',
      niigo: 'from-unit-niigo/10 to-unit-niigo/5',
      vs: 'from-unit-vs/10 to-unit-vs/5',
    }
    return colors[unit] || 'from-sekai-charcoal to-sekai-ink'
  }

  const hasAfterTraining = (rarity: string) => {
    return rarity === 'rarity_3' || rarity === 'rarity_4' || rarity === 'rarity_birthday'
  }

  const getSkillInfo = (skillId: number) => {
    return skills.find(s => s.id === skillId)
  }

  const getSkillDescription = (card: CardData) => {
    const skill = getSkillInfo(card.skillId)
    if (!skill) return '無技能資訊'
    
    // 直接使用 API 返回的 description
    if (skill.description) {
      return skill.description
    }
    
    return '無技能敘述'
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '未知'
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-2">
            <span className="text-gradient-gold">查卡系統</span>
          </h1>
          <p className="mt-2 text-sekai-silver">搜尋卡片、查看技能與綜合力資訊</p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <h3 className="text-sm text-gold-soft mb-4 font-display tracking-wide">篩選條件</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-sekai-mist mb-2">團體</label>
              <select
                value={filters.unit}
                onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
                className="select"
              >
                <option value="">全部團體</option>
                {Object.entries(UNIT_NAMES_TW).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-sekai-mist mb-2">角色</label>
              <select
                value={filters.character}
                onChange={(e) => setFilters({ ...filters, character: Number(e.target.value) })}
                className="select"
              >
                <option value={0}>全部角色</option>
                {Object.entries(CHARACTER_NAMES_TW).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-sekai-mist mb-2">稀有度</label>
              <select
                value={filters.rarity}
                onChange={(e) => setFilters({ ...filters, rarity: e.target.value })}
                className="select"
              >
                <option value="">全部稀有度</option>
                <option value="rarity_4">★★★★</option>
                <option value="rarity_3">★★★</option>
                <option value="rarity_2">★★</option>
                <option value="rarity_1">★</option>
                <option value="rarity_birthday">生日卡</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-sekai-mist mb-2">屬性</label>
              <select
                value={filters.attribute}
                onChange={(e) => setFilters({ ...filters, attribute: e.target.value })}
                className="select"
              >
                <option value="">全部屬性</option>
                {Object.entries(ATTRIBUTE_NAMES_TW).map(([attr, name]) => (
                  <option key={attr} value={attr}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-sekai-mist mb-2">搜尋名稱</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="輸入卡片名稱..."
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-gold-dim border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sekai-silver">載入中...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-sekai-silver mb-4">
              共 {filteredCards.length} 張卡片
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredCards.slice(0, 60).map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`card p-3 border-2 ${getUnitColor(card.characterId)} hover:glow-gold cursor-pointer group transition-all duration-300`}
                >
                  {/* Card Image - 使用完整圖 */}
                  <div className="aspect-[3/4] bg-sekai-charcoal rounded-lg mb-3 overflow-hidden relative">
                    <img
                      src={getCardImageUrl(card.assetbundleName, 'normal')}
                      alt={card.prefix || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // 如果完整圖失敗，嘗試縮圖
                        const img = e.target as HTMLImageElement
                        if (!img.src.includes('thumbnail')) {
                          img.src = getCardThumbnailUrl(card.assetbundleName, 'normal')
                        } else {
                          img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 133"><rect fill="%231a1a1e" width="100" height="133"/><text x="50" y="66" text-anchor="middle" dy=".3em" fill="%234a4a55" font-size="10">No Image</text></svg>'
                        }
                      }}
                    />
                    
                    {/* Rarity Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 bg-sekai-void/80 rounded text-xs ${getRarityColor(card.cardRarityType)}`}>
                      {getRarityStars(card.cardRarityType)}
                    </div>
                    
                    {/* Attribute Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs border ${getAttributeColor(card.attr)}`}>
                      {ATTRIBUTE_NAMES_TW[card.attr] || card.attr}
                    </div>

                    {/* Click hint */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs">點擊查看詳細</span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div>
                    <p className="text-xs text-sekai-mist">
                      {CHARACTER_NAMES_TW[card.characterId] || `角色 ${card.characterId}`}
                    </p>
                    <p className="text-sm text-sekai-pearl truncate mt-1" title={card.prefix || ''}>
                      {card.prefix || '未知卡片'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredCards.length > 60 && (
              <p className="text-center text-sekai-silver mt-8">
                顯示前 60 張，請使用篩選縮小範圍
              </p>
            )}
          </>
        )}

        {/* Card Detail Modal */}
        {selectedCard && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCard(null)}
          >
            <div 
              className={`relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border-2 ${getUnitColor(selectedCard.characterId)} bg-gradient-to-br ${getUnitBgColor(selectedCard.characterId)} bg-sekai-ink`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-sekai-void/80 text-sekai-pearl hover:text-gold-soft hover:bg-sekai-charcoal transition-all flex items-center justify-center"
              >
                ✕
              </button>

              <div className="p-6 sm:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left: Card Image */}
                  <div>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-sekai-charcoal mb-4">
                      <img
                        src={getCardImageUrl(selectedCard.assetbundleName, showAfterTraining ? 'after_training' : 'normal')}
                        alt={selectedCard.prefix || '卡片圖片'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          // 如果是特訓後圖片失敗，先嘗試使用 normal
                          if (showAfterTraining && img.src.includes('after_training')) {
                            img.src = getCardImageUrl(selectedCard.assetbundleName, 'normal')
                          } else {
                            // 最後 fallback 到縮圖
                            img.src = getCardThumbnailUrl(selectedCard.assetbundleName, 'normal')
                          }
                        }}
                      />
                    </div>
                    
                    {/* Image Toggle */}
                    {hasAfterTraining(selectedCard.cardRarityType) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAfterTraining(false)}
                          className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                            !showAfterTraining 
                              ? 'bg-gold-dim/20 text-gold-soft border border-gold-dim/50' 
                              : 'bg-sekai-charcoal text-sekai-silver'
                          }`}
                        >
                          特訓前
                        </button>
                        <button
                          onClick={() => setShowAfterTraining(true)}
                          className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                            showAfterTraining 
                              ? 'bg-gold-dim/20 text-gold-soft border border-gold-dim/50' 
                              : 'bg-sekai-charcoal text-sekai-silver'
                          }`}
                        >
                          特訓後
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Card Details */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-2xl ${getRarityColor(selectedCard.cardRarityType)}`}>
                          {getRarityStars(selectedCard.cardRarityType)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm border ${getAttributeColor(selectedCard.attr)}`}>
                          {ATTRIBUTE_NAMES_TW[selectedCard.attr] || selectedCard.attr}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-sekai-pearl mb-1">{selectedCard.prefix || '未知卡片'}</h2>
                      <p className="text-lg text-sekai-silver">{CHARACTER_NAMES_TW[selectedCard.characterId] || `角色 ${selectedCard.characterId}`}</p>
                      {CHARACTER_UNIT[selectedCard.characterId] && (
                        <p className="text-sm text-sekai-mist mt-1">
                          {UNIT_NAMES_TW[CHARACTER_UNIT[selectedCard.characterId]]}
                        </p>
                      )}
                    </div>

                    {/* Skill Info */}
                    <div className="p-4 rounded-xl bg-sekai-charcoal/50 border border-sekai-ash/30">
                      <h3 className="text-sm text-gold-soft mb-2 font-medium">技能</h3>
                      <p className="text-sekai-pearl font-medium">{selectedCard.cardSkillName}</p>
                      <p className="text-sm text-sekai-silver mt-1">{getSkillDescription(selectedCard)}</p>
                    </div>

                    {/* Flavor Text */}
                    {selectedCard.gachaPhrase && (
                      <div className="p-4 rounded-xl bg-sekai-charcoal/50 border border-sekai-ash/30">
                        <h3 className="text-sm text-gold-soft mb-2 font-medium">轉蛋台詞</h3>
                        <p className="text-sm text-sekai-silver italic">「{selectedCard.gachaPhrase}」</p>
                      </div>
                    )}

                    {/* Release Info */}
                    <div className="text-sm text-sekai-mist">
                      <p>實裝日期：{formatDate(selectedCard.releaseAt)}</p>
                      <p className="mt-1">卡片 ID：{selectedCard.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
