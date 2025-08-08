"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { BiFirstPage, BiLastPage } from "react-icons/bi";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  filterFns,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import React, { useEffect, useState } from "react";
import PaginationSelection from "@/pages/mouvements/entrer/components/PaginationSelection";
import { Badge } from "@/components/ui/badge";
import { Entrer, EntrerProduct } from "../types";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export type PaginationType = {
  pageIndex: number;
  pageSize: number;
};

export function EntrerTable<TData extends Entrer, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 8,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Fonction pour formater les nombres en format français
  const formatNumber = (value: number | string): string => {
    const num = parseFloat(value?.toString() || '0');
    if (isNaN(num)) return '0,00';

    // Convertir en chaîne avec 2 décimales
    const formatted = num.toFixed(2);

    // Ajouter les espaces pour les milliers
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return parts.join(',');
  };

  useEffect(() => {
    setSorting([
      {
        id: "numero_bl",
        desc: false,
      },
    ]);
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      columnFilters,
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    filterFns: {
      ...filterFns,
      multiSelect: filterFns.arrIncludesSome,
      idMultiSelect: filterFns.arrIncludesSome,
      globalSearch: filterFns.includesString,
    },
  });

  return (
    <div className="poppins">
      <div className="flex flex-col gap-3 mb-8 mt-6">
        <div className="flex items-center justify-between">
          <Input
            id="search-numero-bl"
            name="search_numero_bl"
            value={(table.getColumn("numero_bl")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn("numero_bl")?.setFilterValue(event.target.value);
            }}
            placeholder="Rechercher par numéro BL..."
            className="max-w-sm h-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Total ligne</th>
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Manque</th>
                                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Statut</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(row.original as Entrer).products
                                  .sort((a, b) => b.product.product_libelle.localeCompare(a.product.product_libelle))
                                  .map((product, index) => {
                                    const prix = product.prix_achat_produit || 0;
                                    const quantite = product.quantite_produit || 0;
                                    const total = prix * quantite;
                                    // Produit offert : prix = 0
                                    const isOffered = product.prix_achat_produit !== undefined && product.prix_achat_produit !== null && Number(product.prix_achat_produit) === 0;
                                    // Suppression de la logique promotionnelle
                                    const isPromotion = false;

                                    return (
                                      <tr
                                        key={`${row.id}-product-${index}`}
                                        className={cn(
                                          "hover:bg-gray-50",
                                          isOffered ? "bg-orange-50" : ""
                                        )}
                                      >
                                        <td className="px-3 py-2 text-center border-b font-medium text-gray-600">
                                          {index + 1}
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                          <div className="font-medium text-gray-900">
                                            {product.product?.product_libelle || 'N/A'}
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-center border-b text-gray-600">
                                          {product.ref_produit || 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 text-center border-b font-semibold">
                                          {product.quantite_produit || 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 text-center border-b font-semibold">
                                          {product.prix_achat_produit ? `${formatNumber(product.prix_achat_produit.toString())} DH` : 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 text-center border-b font-bold text-green-700">
                                          {(String(product.prix_achat_produit) !== '' && String(product.quantite_produit) !== '')
                                            ? `${formatNumber(total.toString())} DH`
                                            : 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 text-center border-b">
                                          {product.manque ? (
                                            <Badge variant="destructive" className="text-xs px-2 py-1">
                                              {product.manque.toString()}
                                            </Badge>
                                          ) : (
                                            <Badge variant="default" className="text-xs px-2 py-1 bg-green-100 text-green-800 hover:bg-green-100">
                                              Aucun
                                            </Badge>
                                          )}
                                        </td>
                                        <td className="px-3 py-2 text-center border-b">
                                          {/* Badge Offert uniquement */}
                                          {isOffered && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-orange-100 text-orange-800 border-orange-200 px-2 py-1"
                                            >
                                              Offert
                                            </Badge>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                {/* Ligne du total général */}
                                <tr className="bg-blue-50 border-t-2 border-blue-200">
                                  <td colSpan={5} className="px-3 py-3 text-right font-bold text-blue-900">
                                    Total Général :
                                  </td>
                                  <td className="px-3 py-3 text-center font-bold text-blue-900 text-lg">
                                    {(() => {
                                      const entrer = row.original as Entrer;
                                      // Calculer le vrai total des lignes de produits
                                      const totalLignes = entrer.products.reduce((total, product) => {
                                        const prix = product.prix_achat_produit || 0;
                                        const quantite = product.quantite_produit || 0;
                                        return total + (prix * quantite);
                                      }, 0);
                                      return `${formatNumber(totalLignes.toString())} DH`;
                                    })()}
                                  </td>
                                  <td className="px-3 py-3 border-b"></td>
                                  <td className="px-3 py-3 border-b"></td>
                                </tr>
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
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <PaginationSelection
          pagination={pagination}
          setPagination={setPagination}
        />
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Aller à la première page</span>
              <BiFirstPage className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Aller à la page précédente</span>
              <GrFormPrevious className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Aller à la page suivante</span>
              <GrFormNext className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Aller à la dernière page</span>
              <BiLastPage className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
