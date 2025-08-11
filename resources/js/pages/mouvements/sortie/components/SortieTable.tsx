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
import { Sortie, Commercial, Client } from '../types';
import PaginationSelection from './PaginationSelection';
import { CommercialFilter } from '@/components/filters/CommercialFilter';
import { ClientFilter } from '@/components/filters/ClientFilter';
import { ArchivedFilter } from '@/components/filters/ArchivedFilter';
import { DateFilter } from '@/components/filters/DateFilter';
import { GDGFilter } from '@/components/filters/GDGFilter';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IoClose } from 'react-icons/io5';

interface SortieTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    commerciaux?: Commercial[];
    clients?: Client[];
}

export function SortieTable<TData, TValue>({ columns, data, commerciaux = [], clients = [] }: SortieTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        "livreur": false, // Décocher la colonne livreur par défaut
        "total_poids": false, // Décocher la colonne poids total par défaut
    });
    const [rowSelection, setRowSelection] = useState({});
    const [selectedCommerciaux, setSelectedCommerciaux] = useState<string[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [selectedGDG, setSelectedGDG] = useState<string[]>([]);
    const [showArchived, setShowArchived] = useState<boolean>(true);

    // Filtrer les données par commerciaux sélectionnés, clients, dates et archivé
    const filteredData = React.useMemo(() => {
        let filtered = data;

        // Filtrage par archivé
        if (!showArchived) {
            filtered = filtered.filter((sortie) => {
                const sortieData = sortie as Sortie;
                return !sortieData.archived;
            });
        }

        // Filtrage par commerciaux
        if (selectedCommerciaux.length > 0) {
            filtered = filtered.filter((sortie) => {
                const sortieData = sortie as Sortie;
                return selectedCommerciaux.includes(sortieData.commercial.id.toString());
            });
        }

        // Filtrage par clients
        if (selectedClients.length > 0) {
            filtered = filtered.filter((sortie) => {
                const sortieData = sortie as Sortie;
                return selectedClients.includes(sortieData.client.id.toString());
            });
        }

        // Filtrage par dates
        if (selectedDates.length > 0) {
            filtered = filtered.filter((sortie) => {
                const sortieData = sortie as Sortie;
                return selectedDates.includes(sortieData.date_bl);
            });
        }

        // Filtrage par G/DG
        if (selectedGDG.length > 0) {
            filtered = filtered.filter((sortie) => {
                const sortieData = sortie as Sortie;
                const clientGDG = sortieData.client_gdg || 0;
                return selectedGDG.includes(clientGDG.toString());
            });
        }

        return filtered;
    }, [data, showArchived, selectedCommerciaux, selectedClients, selectedDates, selectedGDG]);

    // Calculer le montant général des lignes filtrées
    const totalMontantGeneral = React.useMemo(() => {
        return filteredData.reduce((total, sortie) => {
            const sortieData = sortie as Sortie;
            // Calculer le vrai total des lignes de produits pour chaque sortie
            const totalLignes = sortieData.products.reduce((ligneTotal, product) => {
                return ligneTotal + Number(product.total_ligne || 0);
            }, 0);
            return total + totalLignes;
        }, 0);
    }, [filteredData]);

    // Calculer le nombre de sorties filtrées
    const nombreSortiesFiltrees = filteredData.length;

    const table = useReactTable({
        data: filteredData,
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
            {/* Zone des filtres activés */}
            <FilterArea
                selectedCommerciaux={selectedCommerciaux}
                setSelectedCommerciaux={setSelectedCommerciaux}
                commerciaux={commerciaux}
                selectedClients={selectedClients}
                setSelectedClients={setSelectedClients}
                clients={clients}
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
                selectedGDG={selectedGDG}
                setSelectedGDG={setSelectedGDG}
                showArchived={showArchived}
                setShowArchived={setShowArchived}
                totalMontantGeneral={totalMontantGeneral}
                nombreSortiesFiltrees={nombreSortiesFiltrees}
            />

            <div className="flex items-center py-4 gap-4">
                <Input
                    placeholder="Filtrer par numéro BL..."
                    value={(table.getColumn('numero_bl')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('numero_bl')?.setFilterValue(event.target.value)}
                    className="max-w-[200px]"
                />
                <div className="ml-auto flex items-center gap-4">
                    <DateFilter
                        selectedDates={selectedDates}
                        setSelectedDates={setSelectedDates}
                        label="Date BL"
                    />
                    <ClientFilter
                        selectedClients={selectedClients}
                        setSelectedClients={setSelectedClients}
                        clients={clients}
                        label="Client"
                    />
                    <GDGFilter
                        selectedGDG={selectedGDG}
                        setSelectedGDG={setSelectedGDG}
                        sorties={data as Sortie[]}
                        label="G/DG"
                    />
                    <CommercialFilter
                        selectedCommerciaux={selectedCommerciaux}
                        setSelectedCommerciaux={setSelectedCommerciaux}
                        commerciaux={commerciaux}
                        label="Commercial"
                    />
                    <ArchivedFilter
                        showArchived={showArchived}
                        setShowArchived={setShowArchived}
                        label="Archivées"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
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
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b w-12">N°</th>
                                                                    <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Produit</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Référence</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Quantité</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Prix unit.</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Poids</th>
                                                                    <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Total ligne</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(row.original as Sortie).products
                                                                    .sort((a, b) => b.product.product_libelle.localeCompare(a.product.product_libelle))
                                                                    .map((product, index) => (
                                                                    <tr
                                                                        key={`${row.id}-product-${index}`}
                                                                        className={
                                                                            `hover:bg-gray-50 ${Number(product.prix_produit) === 0 ? 'bg-blue-50' : ''}`
                                                                        }
                                                                    >
                                                                        <td className="px-3 py-2 text-center border-b font-medium text-gray-600">
                                                                            {index + 1}
                                                                        </td>
                                                                        <td className="px-3 py-2 border-b">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium text-gray-900">{product.product.product_libelle}</span>
                                                                                {Number(product.prix_produit) === 0 && (
                                                                                    <span className="text-[10px] px-2 py-0.5 rounded border border-blue-300 bg-blue-100 text-blue-700">Offert</span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center border-b text-gray-600">
                                                                            {product.ref_produit}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center border-b font-semibold">
                                                                            {product.quantite_produit}
                                                                        </td>
                                                                        <td className={`px-3 py-2 text-center border-b font-semibold ${Number(product.prix_produit) === 0 ? 'text-blue-700' : ''}`}>
                                                                            {Number(product.prix_produit).toFixed(2)} DH
                                                                        </td>
                                                                        <td className={`px-3 py-2 text-center border-b font-semibold ${Number(product.prix_produit) === 0 ? 'text-blue-700' : ''}`}>
                                                                            {Number(product.poids_produit).toFixed(2)} kg
                                                                        </td>
                                                                        <td className={`px-3 py-2 text-center border-b font-bold ${Number(product.prix_produit) === 0 ? 'text-blue-700' : 'text-green-700'}`}>
                                                                            {Number(product.total_ligne).toFixed(2)} DH
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {/* Ligne du total général */}
                                                                <tr className="bg-blue-50 border-t-2 border-blue-200">
                                                                    <td colSpan={6} className="px-3 py-3 text-right font-bold text-blue-900">
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
                                                                            <td colSpan={6} className="px-3 py-1 text-right font-medium text-gray-700">
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
                                                                        <td colSpan={6} className="px-3 py-1 text-right font-medium text-gray-700">
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
                                                                        <td colSpan={6} className="px-3 py-1 text-right font-medium text-gray-700">
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
                                                                        <td colSpan={6} className="px-3 py-1 text-right font-medium text-gray-700">
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
                                                                        <td colSpan={6} className="px-3 py-1 text-right font-medium text-gray-700">
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
                                                                            <td colSpan={6} className="px-3 py-3 text-right font-bold text-green-900">
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

// Composant FilterArea pour afficher les filtres activés
function FilterArea({
    selectedCommerciaux,
    setSelectedCommerciaux,
    commerciaux,
    selectedClients,
    setSelectedClients,
    clients,
    selectedDates,
    setSelectedDates,
    selectedGDG,
    setSelectedGDG,
    showArchived,
    setShowArchived,
    totalMontantGeneral,
    nombreSortiesFiltrees,
}: {
    selectedCommerciaux: string[];
    setSelectedCommerciaux: React.Dispatch<React.SetStateAction<string[]>>;
    commerciaux: Commercial[];
    selectedClients: string[];
    setSelectedClients: React.Dispatch<React.SetStateAction<string[]>>;
    clients: Client[];
    selectedDates: string[];
    setSelectedDates: React.Dispatch<React.SetStateAction<string[]>>;
    selectedGDG: string[];
    setSelectedGDG: React.Dispatch<React.SetStateAction<string[]>>;
    showArchived: boolean;
    setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
    totalMontantGeneral: number;
    nombreSortiesFiltrees: number;
}) {
    const hasActiveFilters = selectedCommerciaux.length > 0 || selectedClients.length > 0 || selectedDates.length > 0 || selectedGDG.length > 0 || !showArchived;

    return (
        <div className="flex gap-3 poppins mb-4 min-h-[40px] items-center justify-between">
            <div className="flex gap-3 items-center">
                {hasActiveFilters ? (
                    <>
                        {!showArchived && (
                            <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
                                <span className="text-gray-600">Archivées</span>
                                <Separator orientation="vertical" />
                                <div className="flex gap-2 items-center">
                                    <Badge variant={"secondary"}>
                                        Masquées
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {selectedDates.length > 0 && (
                            <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
                                <span className="text-gray-600">Date BL</span>
                                <Separator orientation="vertical" />
                                <div className="flex gap-2 items-center">
                                    {selectedDates.length < 3 ? (
                                        <>
                                            {selectedDates.map((date, index) => {
                                                const formattedDate = new Date(date).toLocaleDateString('fr-FR');
                                                return (
                                                    <Badge key={index} variant={"secondary"}>
                                                        {formattedDate}
                                                    </Badge>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            <Badge variant={"secondary"}>{selectedDates.length} Selected</Badge>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedCommerciaux.length > 0 && (
                            <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
                                <span className="text-gray-600">Commercial</span>
                                <Separator orientation="vertical" />
                                <div className="flex gap-2 items-center">
                                    {selectedCommerciaux.length < 3 ? (
                                        <>
                                            {selectedCommerciaux.map((commercialId, index) => {
                                                const commercial = commerciaux.find(c => c.id.toString() === commercialId);
                                                return (
                                                    <Badge key={index} variant={"secondary"}>
                                                        {commercial?.commercial_code || commercialId}
                                                    </Badge>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            <Badge variant={"secondary"}>{selectedCommerciaux.length} Selected</Badge>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedClients.length > 0 && (
                            <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
                                <span className="text-gray-600">Client</span>
                                <Separator orientation="vertical" />
                                <div className="flex gap-2 items-center">
                                    {selectedClients.length < 3 ? (
                                        <>
                                            {selectedClients.map((clientId, index) => {
                                                const client = clients.find(c => c.id.toString() === clientId);
                                                return (
                                                    <Badge key={index} variant={"secondary"}>
                                                        {client?.code || clientId}
                                                    </Badge>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            <Badge variant={"secondary"}>{selectedClients.length} Selected</Badge>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedGDG.length > 0 && (
                            <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
                                <span className="text-gray-600">G/DG</span>
                                <Separator orientation="vertical" />
                                <div className="flex gap-2 items-center">
                                    {selectedGDG.length < 3 ? (
                                        <>
                                            {selectedGDG.map((gdgValue, index) => {
                                                let label: string;
                                                if (gdgValue === "0") {
                                                    label = "G/DG 0%";
                                                } else {
                                                    const value = parseInt(gdgValue);
                                                    if (value > 0) {
                                                        label = `G/DG +${value}%`;
                                                    } else {
                                                        label = `G/DG ${value}%`;
                                                    }
                                                }
                                                return (
                                                    <Badge key={index} variant={"secondary"}>
                                                        {label}
                                                    </Badge>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            <Badge variant={"secondary"}>{selectedGDG.length} Selected</Badge>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={() => {
                                setSelectedCommerciaux([]);
                                setSelectedClients([]);
                                setSelectedDates([]);
                                setSelectedGDG([]);
                                setShowArchived(true);
                            }}
                            variant={"ghost"}
                            className="p-1 px-2"
                        >
                            <span>Reset</span>
                            <IoClose />
                        </Button>
                    </>
                ) : (
                    <div className="text-sm text-gray-400">
                        Aucun filtre actif
                    </div>
                )}
            </div>

            {/* Affichage du montant total des lignes filtrées */}
            {nombreSortiesFiltrees > 0 && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <div className="text-sm text-gray-600">
                        Total: <span className="font-medium">{nombreSortiesFiltrees} sortie{nombreSortiesFiltrees > 1 ? 's' : ''}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="text-lg font-bold text-green-700">
                        {totalMontantGeneral.toFixed(2)} DH
                    </div>
                </div>
            )}
        </div>
    );
}


