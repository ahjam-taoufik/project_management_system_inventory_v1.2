"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/ui/chart"
import { Package } from "lucide-react"

interface StockChartProps {
  data: Array<{
    name: string
    valeur: number
  }>
}

export function StockChart({ data }: StockChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Évolution de la Valeur du Stock Disponible (6 derniers mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} DH`, 'Valeur du stock disponible']} />
            <Legend />
            <Line
              type="monotone"
              dataKey="valeur"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Valeur du stock disponible (DH)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
