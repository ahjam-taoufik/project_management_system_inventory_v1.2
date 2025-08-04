'use client';

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    filterFns,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { Sortie } from '../types';
import PaginationSelection from './PaginationSelection';

interface SortieTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function SortieTable<TData, TValue>({ columns, data }: SortieTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        "livreur": false, // Décocher la colonne livreur par défaut
    });
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getExpandedRowModel: getExpandedRowModel(),
        filterFns: {
            ...filterFns,
            multiSelect: filterFns.includesString,
            idMultiSelect: filterFns.includesString,
            globalSearch: filterFns.includesString,
        }, // Extend filterFns with required properties
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filtrer par numéro BL..."
                    value={(table.getColumn('numero_bl')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('numero_bl')?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Colonnes <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                                    <TableRow data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
                                                                    <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Produit</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Référence</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Quantité</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Prix unit.</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Poids</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Total ligne</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(row.original as Sortie).products.map((product, index) => (
                                                                    <tr key={`${row.id}-product-${index}`} className="hover:bg-gray-50">
                                                                        <td className="px-3 py-2 border-b">
                                                                            <div className="font-medium text-gray-900">
                                                                                {product.product.product_libelle}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center border-b text-gray-600">
                                                                            {product.ref_produit}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center border-b font-semibold">
                                                                            {product.quantite_produit}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center border-b font-semibold">
                                                                            {Number(product.prix_produit).toFixed(2)} DH
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center border-b font-semibold">
                                                                            {Number(product.poids_produit).toFixed(2)} kg
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center border-b font-bold text-green-700">
                                                                            {Number(product.total_ligne).toFixed(2)} DH
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {/* Ligne du total général */}
                                                                <tr className="bg-blue-50 border-t-2 border-blue-200">
                                                                    <td colSpan={5} className="px-3 py-3 text-right font-bold text-blue-900">
                                                                        Total Général :
                                                                    </td>
                                                                    <td className="px-3 py-3 text-center font-bold text-blue-900 text-lg">
                                                                        {(() => {
                                                                            const sortie = row.original as Sortie;
                                                                            // Calculer le vrai total des lignes de produits
                                                                            const totalLignes = sortie.products.reduce((total, product) => {
                                                                                return total + Number(product.total_ligne || 0);
                                                                            }, 0);
                                                                            return totalLignes.toFixed(2);
                                                                        })()} DH
                                                                    </td>
                                                                </tr>
                                                                {/* Remise ES (calculée) */}
                                                                {(() => {
                                                                    const sortie = row.original as Sortie;
                                                                    const remiseEs = Number(sortie.remise_es || 0);
                                                                    // Calculer le vrai total des lignes de produits
                                                                    const totalLignes = sortie.products.reduce((total, product) => {
                                                                        return total + Number(product.total_ligne || 0);
                                                                    }, 0);
                                                                    const montantRemiseEs = (totalLignes * remiseEs) / 100;
                                                                    return remiseEs > 0 ? (
                                                                        <tr className="bg-gray-50">
                                                                            <td colSpan={5} className="px-3 py-1 text-right font-medium text-gray-700">
                                                                                Remise ES ({remiseEs}%) :
                                                                            </td>
                                                                            <td className="px-3 py-1 text-center font-semibold text-red-600">
                                                                                -{montantRemiseEs.toFixed(2)} DH
                                                                            </td>
                                                                        </tr>
                                                                    ) : null;
                                                                })()}
                                                                {/* Remise Spéciale */}
                                                                {Number((row.original as Sortie).remise_speciale || 0) > 0 && (
                                                                    <tr className="bg-gray-50">
                                                                        <td colSpan={5} className="px-3 py-1 text-right font-medium text-gray-700">
                                                                            Remise Spéciale :
                                                                        </td>
                                                                        <td className="px-3 py-1 text-center font-semibold text-red-600">
                                                                            -{Number((row.original as Sortie).remise_speciale || 0).toFixed(2)} DH
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                {/* Remise Trimestrielle */}
                                                                {Number((row.original as Sortie).remise_trimestrielle || 0) > 0 && (
                                                                    <tr className="bg-gray-50">
                                                                        <td colSpan={5} className="px-3 py-1 text-right font-medium text-gray-700">
                                                                            Remise Trimestrielle :
                                                                        </td>
                                                                        <td className="px-3 py-1 text-center font-semibold text-red-600">
                                                                            -{Number((row.original as Sortie).remise_trimestrielle || 0).toFixed(2)} DH
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                {/* Valeur Ajoutée */}
                                                                {Number((row.original as Sortie).valeur_ajoutee || 0) !== 0 && (
                                                                    <tr className="bg-gray-50">
                                                                        <td colSpan={5} className="px-3 py-1 text-right font-medium text-gray-700">
                                                                            Valeur Ajoutée :
                                                                        </td>
                                                                        <td className={`px-3 py-1 text-center font-semibold ${Number((row.original as Sortie).valeur_ajoutee || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {Number((row.original as Sortie).valeur_ajoutee || 0) > 0 ? '+' : ''}{Number((row.original as Sortie).valeur_ajoutee || 0).toFixed(2)} DH
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                {/* Retour */}
                                                                {Number((row.original as Sortie).retour || 0) !== 0 && (
                                                                    <tr className="bg-gray-50">
                                                                        <td colSpan={5} className="px-3 py-1 text-right font-medium text-gray-700">
                                                                            Retour :
                                                                        </td>
                                                                        <td className={`px-3 py-1 text-center font-semibold ${Number((row.original as Sortie).retour || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {Number((row.original as Sortie).retour || 0) > 0 ? '+' : ''}{Number((row.original as Sortie).retour || 0).toFixed(2)} DH
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                {/* Montant Final - affiché seulement s'il y a des remises ou ajustements */}
                                                                {(() => {
                                                                    const sortie = row.original as Sortie;
                                                                    // Calculer le vrai total des lignes de produits
                                                                    const totalLignes = sortie.products.reduce((total, product) => {
                                                                        return total + Number(product.total_ligne || 0);
                                                                    }, 0);
                                                                    const remiseEs = Number(sortie.remise_es || 0);
                                                                    const remiseSpeciale = Number(sortie.remise_speciale || 0);
                                                                    const remiseTrimestrielle = Number(sortie.remise_trimestrielle || 0);
                                                                    const valeurAjoutee = Number(sortie.valeur_ajoutee || 0);
                                                                    const retour = Number(sortie.retour || 0);

                                                                    // Calculer le montant de remise ES
                                                                    const montantRemiseEs = (totalLignes * remiseEs) / 100;

                                                                    // Vérifier s'il y a des remises ou ajustements
                                                                    const hasRemises = remiseEs > 0 || remiseSpeciale > 0 || remiseTrimestrielle > 0 || valeurAjoutee !== 0 || retour !== 0;

                                                                    // Calculer le montant final réel
                                                                    const montantFinalCalcule = totalLignes - montantRemiseEs - remiseSpeciale - remiseTrimestrielle + valeurAjoutee + retour;

                                                                    // Afficher le montant final seulement s'il y a des remises ou si le montant final est différent du total général
                                                                    return (hasRemises || Math.abs(totalLignes - montantFinalCalcule) > 0.01) ? (
                                                                        <tr className="bg-green-50 border-t-2 border-green-200">
                                                                            <td colSpan={5} className="px-3 py-3 text-right font-bold text-green-900">
                                                                                Montant Final :
                                                                            </td>
                                                                            <td className="px-3 py-3 text-center font-bold text-green-900 text-lg">
                                                                                {montantFinalCalcule.toFixed(2)} DH
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Aucun résultat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <PaginationSelection table={table} />
        </div>
    );
}
