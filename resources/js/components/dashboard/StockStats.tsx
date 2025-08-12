"use client"

import { StatCard } from "./StatCard"
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"

interface StockStatsProps {
  stats: {
    total_products: number
    products_with_stock: number
    products_out_of_stock: number
    products_low_stock: number
    total_stock_value: string
    total_stock_value_achat: string
    top_products_by_stock: Array<{
      product_name: string
      stock_disponible: number
      stock_minimum: number
    }>
    out_of_stock_products: Array<{
      product_name: string
      stock_disponible: number
    }>
  }
}

export function StockStats({ stats }: StockStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Produits"
          value={stats.total_products}
          icon={Package}
          description="Produits actifs"
        />
        <StatCard
          title="Avec Stock"
          value={stats.products_with_stock}
          icon={TrendingUp}
          description="Produits en stock"
        />
        <StatCard
          title="Rupture de Stock"
          value={stats.products_out_of_stock}
          icon={AlertTriangle}
          description="Produits épuisés"
          className="border-l-4 border-l-red-500"
        />
        <StatCard
          title="Stock Faible"
          value={stats.products_low_stock}
          icon={AlertTriangle}
          description="Stock sous le minimum"
          className="border-l-4 border-l-orange-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Valeur Stock Disponible (Vente)"
          value={`${stats.total_stock_value} DH`}
          icon={DollarSign}
          description="Valeur au prix de vente"
        />
        <StatCard
          title="Valeur Stock Disponible (Achat)"
          value={`${stats.total_stock_value_achat} DH`}
          icon={DollarSign}
          description="Valeur au prix d'achat"
        />
      </div>

      {stats.top_products_by_stock.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top 5 Produits par Stock
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.top_products_by_stock.map((product, index) => (
              <StatCard
                key={index}
                title={product.product_name}
                value={product.stock_disponible}
                description={`Min: ${product.stock_minimum}`}
                className="border-l-4 border-l-green-500"
              />
            ))}
          </div>
        </div>
      )}

      {stats.out_of_stock_products.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Produits en Rupture de Stock
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.out_of_stock_products.map((product, index) => (
              <StatCard
                key={index}
                title={product.product_name}
                value={product.stock_disponible}
                description="Stock épuisé"
                className="border-l-4 border-l-red-500"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
