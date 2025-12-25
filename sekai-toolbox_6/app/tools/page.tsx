'use client'

import { useState } from 'react'

export default function ToolsPage() {
  const [stamina, setStamina] = useState(10)
  const [boostMultiplier, setBoostMultiplier] = useState(5)
  const [efficiency, setEfficiency] = useState(200)
  const [targetPT, setTargetPT] = useState(1000000)
  const [currentPT, setCurrentPT] = useState(0)

  const remainingPT = targetPT - currentPT
  const boostsNeeded = Math.ceil(remainingPT / efficiency)
  const energyNeeded = boostsNeeded * stamina
  const drinksNeeded = Math.ceil(energyNeeded / 10)
  const gamesNeeded = Math.ceil(boostsNeeded / boostMultiplier)
  const timeNeeded = gamesNeeded * 2.5

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="mb-8">
          <h1 className="heading-1 text-gradient-gold mb-4">快速 PT 計算</h1>
          <p className="text-sekai-silver">
            計算衝榜所需的場次、體力與時間
          </p>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="label mb-2">目標 PT</label>
                <input
                  type="number"
                  className="input w-full"
                  value={targetPT}
                  onChange={(e) => setTargetPT(Number(e.target.value))}
                  step={100000}
                />
              </div>
              
              <div>
                <label className="label mb-2">目前 PT</label>
                <input
                  type="number"
                  className="input w-full"
                  value={currentPT}
                  onChange={(e) => setCurrentPT(Number(e.target.value))}
                  step={10000}
                />
              </div>

              <div>
                <label className="label mb-2">每局 PT 效率</label>
                <input
                  type="number"
                  className="input w-full"
                  value={efficiency}
                  onChange={(e) => setEfficiency(Number(e.target.value))}
                />
                <p className="text-xs text-sekai-mist mt-1">單次消耗體力可獲得的 PT</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label mb-2">體力消耗</label>
                  <select 
                    className="input w-full"
                    value={stamina}
                    onChange={(e) => setStamina(Number(e.target.value))}
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                  </select>
                </div>
                <div>
                  <label className="label mb-2">倍率</label>
                  <select 
                    className="input w-full"
                    value={boostMultiplier}
                    onChange={(e) => setBoostMultiplier(Number(e.target.value))}
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-sekai-charcoal rounded-xl p-6">
              <h3 className="heading-3 mb-4 text-gold-soft">計算結果</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sekai-mist">需要 PT</span>
                  <span className="text-2xl font-bold text-sekai-pearl">
                    {remainingPT.toLocaleString()}
                  </span>
                </div>
                
                <div className="border-t border-sekai-ash/30 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">需要場次</span>
                    <span className="text-sekai-pearl font-medium">{gamesNeeded.toLocaleString()} 場</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">需要體力</span>
                    <span className="text-sekai-pearl font-medium">{energyNeeded.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">大型能量飲料</span>
                    <span className="text-sekai-pearl font-medium">~{drinksNeeded.toLocaleString()} 瓶</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">預估時間</span>
                    <span className="text-sekai-pearl font-medium">
                      ~{Math.floor(timeNeeded / 60)}h {Math.round(timeNeeded % 60)}m
                    </span>
                  </div>
                </div>

                <div className="border-t border-sekai-ash/30 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-sekai-mist">進度</span>
                    <span className="text-gold-soft">
                      {((currentPT / targetPT) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-sekai-ink rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gold-dim to-gold-soft rounded-full transition-all"
                      style={{ width: `${Math.min((currentPT / targetPT) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
