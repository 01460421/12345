'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchMysekaiFixtures, fetchMysekaiFixtureBlueprints, fetchMysekaiFixtureMainGenres, fetchMysekaiFixtureSubGenres, getMysekaiFixtureImageUrl } from '@/lib/api'

interface Fixture {
  id: number
  seq: number
  mysekaiFixtureType: string
  name: string
  description?: string
  assetbundleName: string
  mysekaiFixtureMainGenreId?: number
  mysekaiFixtureSubGenreId?: number
}

interface Blueprint {
  id: number
  mysekaiFixtureId: number
  blueprintObtainType: string
}

interface Genre {
  id: number
  name: string
  seq: number
}

export default function FurniturePage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [mainGenres, setMainGenres] = useState<Genre[]>([])
  const [subGenres, setSubGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [owned, setOwned] = useState<Set<number>>(new Set())
  const [filterType, setFilterType] = useState('all')
  const [filterGenre, setFilterGenre] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [fixturesData, blueprintsData, mainGenresData, subGenresData] = await Promise.all([
          fetchMysekaiFixtures(),
          fetchMysekaiFixtureBlueprints().catch(() => []),
          fetchMysekaiFixtureMainGenres().catch(() => []),
          fetchMysekaiFixtureSubGenres().catch(() => [])
        ])
        setFixtures(fixturesData.sort((a: Fixture, b: Fixture) => a.seq - b.seq))
        setBlueprints(blueprintsData)
        setMainGenres(mainGenresData)
        setSubGenres(subGenresData)
      } catch (error) {
        console.error('Failed to load fixtures:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('mysekai-furniture-owned')
    if (saved) setOwned(new Set(JSON.parse(saved)))
  }, [])

  const toggleOwned = (id: number) => {
    const newOwned = new Set(owned)
    if (newOwned.has(id)) newOwned.delete(id)
    else newOwned.add(id)
    setOwned(newOwned)
    localStorage.setItem('mysekai-furniture-owned', JSON.stringify(Array.from(newOwned)))
  }

  const types = useMemo(() => {
    const t = new Set(fixtures.map(f => f.mysekaiFixtureType))
    return ['all', ...Array.from(t)]
  }, [fixtures])

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      'all': '全部',
      'general': '一般家具',
      'small_item': '小物',
      'wall': '壁掛',
      'wallpaper': '壁紙',
      'floor': '地板',
      'rug': '地毯',
      'path': '道路',
      'work_table': '工作檯',
      'conversion_machine': '轉換機',
      'music_player': '音樂播放器',
      'display': '展示架',
      'canvas': '無框畫',
      'plushie': '娃娃',
      'gate': '門',
      'exterior': '室外',
      'interior': '室內',
    }
    return names[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'small_item': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      'wall': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      'wallpaper': 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      'floor': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      'work_table': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      'display': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      'canvas': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      'plushie': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
    }
    return colors[type] || 'bg-sekai-charcoal text-sekai-silver border-sekai-ash/30'
  }

  const getGenreName = (genreId: number | undefined) => {
    if (!genreId) return ''
    const genre = mainGenres.find(g => g.id === genreId)
    return genre?.name || ''
  }

  const filteredFixtures = useMemo(() => {
    return fixtures.filter(f => {
      if (filterType !== 'all' && f.mysekaiFixtureType !== filterType) return false
      if (filterGenre !== 'all' && f.mysekaiFixtureMainGenreId?.toString() !== filterGenre) return false
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [fixtures, filterType, filterGenre, search])

  const stats = useMemo(() => {
    const total = fixtures.length
    const collected = fixtures.filter(f => owned.has(f.id)).length
    return { total, collected, rate: total > 0 ? (collected / total * 100) : 0 }
  }, [fixtures, owned])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-sekai-silver">載入家具資料中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
              MySEKAI 家具圖鑑
            </span>
          </h1>
          <p className="mt-2 text-sekai-silver">收集並追蹤您的家具藍圖</p>
        </div>

        {/* Stats */}
        <div className="card p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
          <div className="grid sm:grid-cols-3 gap-6 relative">
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">總家具數</p>
              <p className="number-xl mt-1">{stats.total}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">已收集</p>
              <p className="number-xl mt-1 text-amber-400">{stats.collected}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">收集率</p>
              <p className="number-xl mt-1">{stats.rate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-4 relative">
            <div className="progress-bar h-2">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${stats.rate}%` }} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋家具..."
              className="input flex-1"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input w-full sm:w-40"
            >
              {types.map(t => (
                <option key={t} value={t}>{getTypeName(t)}</option>
              ))}
            </select>
            {mainGenres.length > 0 && (
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="input w-full sm:w-40"
              >
                <option value="all">全部系列</option>
                {mainGenres.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-sekai-silver">
            顯示 {filteredFixtures.length} 項家具
          </p>
          <button
            onClick={() => {
              setOwned(new Set())
              localStorage.removeItem('mysekai-furniture-owned')
            }}
            className="text-sm text-sekai-mist hover:text-unit-vbs"
          >
            重置收集
          </button>
        </div>

        {/* Furniture Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFixtures.map((fixture) => {
            const isOwned = owned.has(fixture.id)
            const genreName = getGenreName(fixture.mysekaiFixtureMainGenreId)

            return (
              <div
                key={fixture.id}
                onClick={() => toggleOwned(fixture.id)}
                className={`card p-4 cursor-pointer transition-all group ${
                  isOwned
                    ? 'border-amber-500/50 bg-amber-500/5 shadow-lg shadow-amber-500/10'
                    : 'hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sekai-charcoal to-sekai-ink flex items-center justify-center overflow-hidden border border-sekai-ash/20">
                    <img
                      src={getMysekaiFixtureImageUrl(fixture.assetbundleName)}
                      alt={fixture.name}
                      className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.style.display = 'none'
                        img.parentElement!.innerHTML = '🪑'
                      }}
                    />
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isOwned
                      ? 'bg-amber-500 border-amber-500 text-sekai-void'
                      : 'border-sekai-ash hover:border-amber-500/50'
                  }`}>
                    {isOwned && '✓'}
                  </div>
                </div>

                <h3 className="font-medium text-sekai-pearl truncate mb-2">{fixture.name}</h3>
                
                <div className="flex flex-wrap gap-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${getTypeColor(fixture.mysekaiFixtureType)}`}>
                    {getTypeName(fixture.mysekaiFixtureType)}
                  </span>
                  {genreName && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-sekai-charcoal text-sekai-silver border border-sekai-ash/30">
                      {genreName}
                    </span>
                  )}
                </div>

                {fixture.description && (
                  <p className="mt-2 text-xs text-sekai-mist line-clamp-2">
                    {fixture.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {filteredFixtures.length === 0 && (
          <div className="text-center py-12 text-sekai-silver">
            沒有找到符合條件的家具
          </div>
        )}
      </div>
    </div>
  )
}
