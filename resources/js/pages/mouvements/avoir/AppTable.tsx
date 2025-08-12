"use client";
import { usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvoirDialog from "./components/AvoirDialog";
import { columns } from "./config/columns";
import { AvoirTable } from "./components/AvoirTable";
import type { Avoir, Client, Commercial, Livreur, Product } from "./types";
import { useEffect } from "react";

export default function AppTable() {
    const { props: { avoirs, clients, commerciaux, livreurs, products } } = usePage();
    const avoirsArray = avoirs as Avoir[];
    const clientsArray = clients as Client[];
    const commerciauxArray = commerciaux as Commercial[];
    const livreursArray = livreurs as Livreur[];
    const productsArray = products as Product[];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                document.getElementById('add-avoir-button')?.click();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <Card className="mt-6 md:mt-12 flex flex-col shadow-none poppins border-none w-full max-w-full overflow-x-auto">
            <CardHeader className="flex justify-between p-2 md:p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                    <div>
                        <CardTitle className="font-bold text-lg sm:text-xl md:text-2xl">Avoirs</CardTitle>
                        <p className="text-muted-foreground text-sm md:text-base">
                            {avoirsArray.length} {avoirsArray.length > 1 ? "Avoirs" : "Avoir"}
                        </p>
                    </div>
                    <div className="w-full md:w-auto">
                        <AvoirDialog
                            clients={clientsArray}
                            commerciaux={commerciauxArray}
                            livreurs={livreursArray}
                            products={productsArray}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-1 sm:p-2 md:p-4 w-full overflow-x-auto">
                <div className="min-w-[300px]">
                    <AvoirTable
                        data={avoirsArray}
                        columns={columns}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
