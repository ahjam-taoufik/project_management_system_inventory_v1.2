"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"

interface SortieChartProps {
  data: Array<{
    name: string
    sorties: number
    montant: number
  }>
}

export function SortieChart({ data }: SortieChartProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Graphique en barres pour le nombre de sorties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Nombre de Sorties (6 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sorties" fill="#3b82f6" name="Nombre de sorties" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique en ligne pour les montants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Montants des Sorties (6 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} DH`, 'Montant']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="montant"
                stroke="#10b981"
                strokeWidth={2}
                name="Montant (DH)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
