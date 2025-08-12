<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Sortie;
use App\Models\Stock;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with statistics.
     */
    public function index(): Response
    {
        try {
            // Statistiques des sorties
            $sortieStats = $this->getSortieStats();
            Log::info('Dashboard - Sortie stats calculated', ['count' => count($sortieStats)]);

            // Statistiques du stock
            $stockStats = $this->getStockStats();
            Log::info('Dashboard - Stock stats calculated', ['count' => count($stockStats)]);

            // Données pour les graphiques
            $chartData = $this->getChartData();
            Log::info('Dashboard - Chart data calculated', ['months' => count($chartData['months'] ?? [])]);

            return Inertia::render('dashboard', [
                'sortieStats' => $sortieStats,
                'stockStats' => $stockStats,
                'chartData' => $chartData,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            // Retourner des données par défaut en cas d'erreur
            return Inertia::render('dashboard', [
                'sortieStats' => $this->getDefaultSortieStats(),
                'stockStats' => $this->getDefaultStockStats(),
                'chartData' => $this->getDefaultChartData(),
            ]);
        }
    }

    /**
     * Get sortie statistics
     */
    private function getSortieStats(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfYear = $now->copy()->startOfYear();

        // Statistiques générales
        $totalSorties = (int) Sortie::count();
        $sortiesThisMonth = (int) Sortie::where('created_at', '>=', $startOfMonth)->count();
        $sortiesThisYear = (int) Sortie::where('created_at', '>=', $startOfYear)->count();

        // Montants - conversion explicite en float
        $totalMontant = (float) (Sortie::sum('montant_total_final') ?? 0);
        $montantThisMonth = (float) (Sortie::where('created_at', '>=', $startOfMonth)->sum('montant_total_final') ?? 0);
        $montantThisYear = (float) (Sortie::where('created_at', '>=', $startOfYear)->sum('montant_total_final') ?? 0);

        // Sorties archivées
        $sortiesArchived = (int) Sortie::where('archived', true)->count();
        $sortiesActive = (int) Sortie::where('archived', false)->count();

        // Top 5 des commerciaux par montant
        $topCommerciaux = Sortie::with('commercial')
            ->select('commercial_id', DB::raw('SUM(montant_total_final) as total_montant'), DB::raw('COUNT(*) as nombre_sorties'))
            ->groupBy('commercial_id')
            ->orderBy('total_montant', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'commercial_name' => $item->commercial->commercial_fullName ?? 'N/A',
                    'total_montant' => number_format((float) ($item->total_montant ?? 0), 2),
                    'nombre_sorties' => (int) ($item->nombre_sorties ?? 0),
                ];
            })
            ->toArray();

        return [
            'total_sorties' => $totalSorties,
            'sorties_this_month' => $sortiesThisMonth,
            'sorties_this_year' => $sortiesThisYear,
            'total_montant' => number_format($totalMontant, 2),
            'montant_this_month' => number_format($montantThisMonth, 2),
            'montant_this_year' => number_format($montantThisYear, 2),
            'sorties_archived' => $sortiesArchived,
            'sorties_active' => $sortiesActive,
            'top_commerciaux' => $topCommerciaux,
        ];
    }

    /**
     * Get stock statistics
     */
    private function getStockStats(): array
    {
        // Statistiques générales du stock
        $totalProducts = (int) Product::where('product_isActive', true)->count();
        $productsWithStock = (int) Stock::where('stock_disponible', '>', 0)->count();
        $productsOutOfStock = (int) Stock::where('stock_disponible', '<=', 0)->count();
        $productsLowStock = (int) Stock::where('stock_disponible', '<=', DB::raw('stock_minimum'))
            ->where('stock_disponible', '>', 0)
            ->count();

        // Valeurs du stock - conversion explicite en float
        $totalStockValue = (float) Stock::with('product')
            ->get()
            ->sum(function ($stock) {
                return ((float) ($stock->stock_disponible ?? 0)) * ((float) ($stock->product->prix_vente_colis ?? 0));
            });

        $totalStockValueAchat = (float) Stock::with('product')
            ->get()
            ->sum(function ($stock) {
                return ((float) ($stock->stock_disponible ?? 0)) * ((float) ($stock->product->prix_achat_colis ?? 0));
            });

        // Top 5 des produits par stock
        $topProductsByStock = Stock::with('product')
            ->where('stock_disponible', '>', 0)
            ->orderBy('stock_disponible', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($stock) {
                return [
                    'product_name' => $stock->product->product_libelle ?? 'N/A',
                    'stock_disponible' => (int) ($stock->stock_disponible ?? 0),
                    'stock_minimum' => (int) ($stock->stock_minimum ?? 0),
                ];
            })
            ->toArray();

        // Produits en rupture de stock
        $outOfStockProducts = Stock::with('product')
            ->where('stock_disponible', '<=', 0)
            ->orderBy('stock_disponible', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($stock) {
                return [
                    'product_name' => $stock->product->product_libelle ?? 'N/A',
                    'stock_disponible' => (int) ($stock->stock_disponible ?? 0),
                ];
            })
            ->toArray();

        return [
            'total_products' => $totalProducts,
            'products_with_stock' => $productsWithStock,
            'products_out_of_stock' => $productsOutOfStock,
            'products_low_stock' => $productsLowStock,
            'total_stock_value' => number_format($totalStockValue, 2),
            'total_stock_value_achat' => number_format($totalStockValueAchat, 2),
            'top_products_by_stock' => $topProductsByStock,
            'out_of_stock_products' => $outOfStockProducts,
        ];
    }

    /**
     * Get chart data for the last 6 months
     */
    private function getChartData(): array
    {
        $months = [];
        $sortieData = [];
        $stockData = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');

            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            // Données des sorties
            $sortieCount = (int) Sortie::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
            $sortieMontant = (float) (Sortie::whereBetween('created_at', [$startOfMonth, $endOfMonth])->sum('montant_total_final') ?? 0);

            $sortieData[] = [
                'name' => $date->format('M Y'),
                'sorties' => $sortieCount,
                'montant' => round($sortieMontant, 2),
            ];

            // Données du stock (moyenne du mois)
            $stockValue = (float) Stock::with('product')
                ->get()
                ->sum(function ($stock) use ($date) {
                    // Pour simplifier, on utilise la valeur actuelle
                    return ((float) ($stock->stock_disponible ?? 0)) * ((float) ($stock->product->prix_vente_colis ?? 0));
                });

            $stockData[] = [
                'name' => $date->format('M Y'),
                'valeur' => round($stockValue, 2),
            ];
        }

        return [
            'months' => $months,
            'sortie_data' => $sortieData,
            'stock_data' => $stockData,
        ];
    }

    /**
     * Get default sortie stats
     */
    private function getDefaultSortieStats(): array
    {
        return [
            'total_sorties' => 0,
            'sorties_this_month' => 0,
            'sorties_this_year' => 0,
            'total_montant' => '0.00',
            'montant_this_month' => '0.00',
            'montant_this_year' => '0.00',
            'sorties_archived' => 0,
            'sorties_active' => 0,
            'top_commerciaux' => [],
        ];
    }

    /**
     * Get default stock stats
     */
    private function getDefaultStockStats(): array
    {
        return [
            'total_products' => 0,
            'products_with_stock' => 0,
            'products_out_of_stock' => 0,
            'products_low_stock' => 0,
            'total_stock_value' => '0.00',
            'total_stock_value_achat' => '0.00',
            'top_products_by_stock' => [],
            'out_of_stock_products' => [],
        ];
    }

    /**
     * Get default chart data
     */
    private function getDefaultChartData(): array
    {
        return [
            'months' => [],
            'sortie_data' => [],
            'stock_data' => [],
        ];
    }
}
