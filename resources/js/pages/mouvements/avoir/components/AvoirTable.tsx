"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getExpandedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Avoir } from "../types";
import React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function AvoirTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const getSortIcon = (column: any) => {
    if (!column.getCanSort()) return null;

    if (column.getIsSorted() === "asc") {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }
    if (column.getIsSorted() === "desc") {
      return <ChevronDown className="ml-2 h-4 w-4" />;
    }
    return <ChevronsUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Rechercher dans tous les avoirs..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center justify-center ${
                            header.column.getCanSort() ? "cursor-pointer select-none" : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {getSortIcon(header.column)}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={columns.length} className="p-0">
                        <div className="bg-gray-50 p-4">
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b w-12">N°</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Produit</th>
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Référence</th>
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Quantité</th>
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Prix unit.</th>
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Prix original</th>
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Raison détail</th>
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Total ligne</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(row.original as Avoir).products
                                  .sort((a, b) => b.product?.product_libelle?.localeCompare(a.product?.product_libelle || '') || 0)
                                  .map((product, index) => (
                                  <tr
                                    key={`${row.id}-product-${index}`}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-3 py-2 text-center border-b font-medium text-gray-600">
                                      {index + 1}
                                    </td>
                                    <td className="px-3 py-2 border-b">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{product.product?.product_libelle || 'Produit supprimé'}</span>
                                        {product.prix_personnalise && (
                                          <span className="text-[10px] px-2 py-0.5 rounded border border-orange-300 bg-orange-100 text-orange-700">Prix modifié</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-3 py-2 text-center border-b text-gray-600">
                                      {product.product?.product_Ref || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center border-b font-semibold">
                                      {product.quantite_retournee}
                                    </td>
                                    <td className="px-3 py-2 text-center border-b font-semibold">
                                      {Number(product.prix_unitaire).toFixed(2)} DH
                                    </td>
                                    <td className="px-3 py-2 text-center border-b font-semibold">
                                      {Number(product.prix_original).toFixed(2)} DH
                                    </td>
                                    <td className="px-3 py-2 text-center border-b text-gray-600">
                                      {product.raison_detail || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center border-b font-bold text-green-700">
                                      {Number(product.montant_ligne).toFixed(2)} DH
                                    </td>
                                  </tr>
                                ))}
                                {/* Raison du retour */}
                                {(row.original as Avoir).raison_retour && (
                                  <tr className="bg-yellow-50 border-t-2 border-yellow-200">
                                    <td colSpan={7} className="px-3 py-3 text-left font-medium text-yellow-900">
                                      <div className="flex items-start gap-2">
                                        <span className="font-semibold">Raison du retour :</span>
                                        <span className="text-sm">{(row.original as Avoir).raison_retour}</span>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                                {/* Ligne du total général */}
                                <tr className="bg-blue-50 border-t-2 border-blue-200">
                                  <td colSpan={7} className="px-3 py-3 text-right font-bold text-blue-900">
                                    Total Général :
                                  </td>
                                  <td className="px-3 py-3 text-center font-bold text-blue-900 text-lg">
                                    {(() => {
                                      const avoir = row.original as Avoir;
                                      // Calculer le total des lignes de produits
                                      const totalLignes = avoir.products.reduce((total, product) => {
                                        return total + Number(product.montant_ligne || 0);
                                      }, 0);
                                      return totalLignes.toFixed(2);
                                    })()} DH
                                  </td>
                                </tr>
                                {/* Ajustement financier */}
                                {Number((row.original as Avoir).ajustement_financier || 0) !== 0 && (
                                  <tr className="bg-gray-50">
                                    <td colSpan={7} className="px-3 py-1 text-right font-medium text-gray-700">
                                      Ajustement Financier :
                                    </td>
                                    <td className={`px-3 py-1 text-center font-semibold ${Number((row.original as Avoir).ajustement_financier || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {Number((row.original as Avoir).ajustement_financier || 0) > 0 ? '+' : ''}{Number((row.original as Avoir).ajustement_financier || 0).toFixed(2)} DH
                                    </td>
                                  </tr>
                                )}
                                {/* Montant Final */}
                                {(() => {
                                  const avoir = row.original as Avoir;
                                  const totalLignes = avoir.products.reduce((total, product) => {
                                    return total + Number(product.montant_ligne || 0);
                                  }, 0);
                                  const ajustementFinancier = Number(avoir.ajustement_financier || 0);
                                  const montantFinal = totalLignes + ajustementFinancier;

                                  // Afficher le montant final seulement s'il y a un ajustement financier
                                  return ajustementFinancier !== 0 ? (
                                    <tr className="bg-green-50 border-t-2 border-green-200">
                                      <td colSpan={7} className="px-3 py-3 text-right font-bold text-green-900">
                                        Montant Final :
                                      </td>
                                      <td className="px-3 py-3 text-center font-bold text-green-900 text-lg">
                                        {montantFinal.toFixed(2)} DH
                                      </td>
                                    </tr>
                                  ) : null;
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun avoir trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
