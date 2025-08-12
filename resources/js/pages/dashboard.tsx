import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { SortieStats } from '@/components/dashboard/SortieStats';
import { StockStats } from '@/components/dashboard/StockStats';
import { SortieChart } from '@/components/dashboard/SortieChart';
import { StockChart } from '@/components/dashboard/StockChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    sortieStats?: {
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
    stockStats?: {
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
    chartData?: {
        months: string[]
        sortie_data: Array<{
            name: string
            sorties: number
            montant: number
        }>
        stock_data: Array<{
            name: string
            valeur: number
        }>
    }
}

export default function Dashboard({
    sortieStats = {
        total_sorties: 0,
        sorties_this_month: 0,
        sorties_this_year: 0,
        total_montant: "0.00",
        montant_this_month: "0.00",
        montant_this_year: "0.00",
        sorties_archived: 0,
        sorties_active: 0,
        top_commerciaux: []
    },
    stockStats = {
        total_products: 0,
        products_with_stock: 0,
        products_out_of_stock: 0,
        products_low_stock: 0,
        total_stock_value: "0.00",
        total_stock_value_achat: "0.00",
        top_products_by_stock: [],
        out_of_stock_products: []
    },
    chartData = {
        months: [],
        sortie_data: [],
        stock_data: []
    }
}: DashboardProps) {
    const { props } = usePage();

    useEffect(() => {
        console.log('Dashboard props:', props);
        console.log('sortieStats:', sortieStats);
        console.log('stockStats:', stockStats);
        console.log('chartData:', chartData);
    }, [props, sortieStats, stockStats, chartData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 overflow-x-auto">
                {/* En-tête du Dashboard */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Vue d'ensemble des statistiques des sorties et du stock
                    </p>
                </div>

                {/* Statistiques des Sorties */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Statistiques des Sorties
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SortieStats stats={sortieStats} />
                    </CardContent>
                </Card>

                {/* Graphiques des Sorties */}
                {chartData?.sortie_data && chartData.sortie_data.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Évolution des Sorties
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SortieChart data={chartData.sortie_data} />
                        </CardContent>
                    </Card>
                )}

                {/* Statistiques du Stock */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Statistiques du Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StockStats stats={stockStats} />
                    </CardContent>
                </Card>

                {/* Graphique du Stock */}
                {chartData?.stock_data && chartData.stock_data.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Évolution du Stock
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StockChart data={chartData.stock_data} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
