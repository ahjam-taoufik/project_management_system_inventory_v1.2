"use client";
import { ColumnDef } from "@tanstack/react-table";
import type { Promotion, PromotionContext } from "@/pages/promotion/shared/types";

export function createPromotionColumns({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}: { context: PromotionContext }): ColumnDef<Promotion>[] {
  return [
    {
      accessorFn: (row) => row.produit_promotionnel?.product_libelle || "",
      id: "produit_promotionnel",
      header: "Produit Promotionnel",
      cell: ({ row }) => {
        const produit = row.original.produit_promotionnel;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{produit?.product_libelle || "N/A"}</span>
            <span className="text-xs text-muted-foreground">{produit?.product_Ref || ""}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "quantite_produit_promotionnel",
      header: "Quantité Promotionnelle",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.getValue("quantite_produit_promotionnel") as string}</span>
          </div>
        );
      },
    },
    {
      accessorFn: (row) => row.produit_offert?.product_libelle || "",
      id: "produit_offert",
      header: "Produit Offert",
      cell: ({ row }) => {
        const produit = row.original.produit_offert;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{produit?.product_libelle || "N/A"}</span>
            <span className="text-xs text-muted-foreground">{produit?.product_Ref || ""}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "quantite_produit_offert",
      header: "Quantité Offerte",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.getValue("quantite_produit_offert") as string}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Statut",
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return (
          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${
            isActive ? "text-green-700 border-green-300 bg-green-50" : "text-red-700 border-red-300 bg-red-50"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];
}


