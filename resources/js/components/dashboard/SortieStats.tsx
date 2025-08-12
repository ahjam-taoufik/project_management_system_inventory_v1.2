"use client"

import { StatCard } from "./StatCard"
import { Package, TrendingUp, Archive, Users } from "lucide-react"

interface SortieStatsProps {
  stats: {
    total_sorties: number
    sorties_this_month: number
    sorties_this_year: number
    total_montant: string
    montant_this_month: string
    montant_this_year: string
    sorties_archived: number
    sorties_active: number
    top_commerciaux: Array<{
      commercial_name: string
      total_montant: string
      nombre_sorties: number
    }>
  }
}

export function SortieStats({ stats }: SortieStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sorties"
          value={stats.total_sorties}
          icon={Package}
          description="Nombre total de sorties"
        />
        <StatCard
          title="Sorties ce mois"
          value={stats.sorties_this_month}
          icon={TrendingUp}
          description="Sorties du mois en cours"
        />
        <StatCard
          title="Montant Total"
          value={`${stats.total_montant} DH`}
          icon={TrendingUp}
          description="Montant total des sorties"
        />
        <StatCard
          title="Montant ce mois"
          value={`${stats.montant_this_month} DH`}
          icon={TrendingUp}
          description="Montant du mois en cours"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Sorties Actives"
          value={stats.sorties_active}
          icon={Package}
          description="Sorties non archivées"
        />
        <StatCard
          title="Sorties Archivées"
          value={stats.sorties_archived}
          icon={Archive}
          description="Sorties archivées"
        />
      </div>

      {stats.top_commerciaux.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top 5 Commerciaux par Montant
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.top_commerciaux.map((commercial, index) => (
              <StatCard
                key={index}
                title={commercial.commercial_name}
                value={`${commercial.total_montant} DH`}
                description={`${commercial.nombre_sorties} sorties`}
                className="border-l-4 border-l-blue-500"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
