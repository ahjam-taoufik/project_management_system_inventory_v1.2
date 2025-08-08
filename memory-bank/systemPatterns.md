# System Patterns - Architecture & Design Decisions

## Core Architecture

### MVC with Inertia.js Pattern
```
Browser (React) ↔ Inertia.js ↔ Laravel Controllers ↔ Eloquent Models ↔ MySQL
```

- **Controllers**: Handle HTTP requests, return Inertia responses
- **Models**: Eloquent ORM with proper relationships
- **Views**: React components via Inertia.js (no Blade except app.blade.php)
- **Routes**: SPA routing through Laravel with Inertia navigation

### ⚠️ CRITICAL RULE: Always Use Inertia.js Instead of Fetch

**RULE**: In this project, **ALWAYS use Inertia.js** (`router.post()`, `router.put()`, `router.delete()`) instead of native `fetch()` for all HTTP requests.

**Exceptions (cas particuliers)**:
1. **API calls for dynamic data loading** (e.g., `/api/product-details/{id}` for populating form fields)
2. **Real-time validation checks** (e.g., `/api/check-bl-exists/{numeroBl}` for duplicate checking)
3. **File uploads with progress tracking** (if needed)
4. **WebSocket connections** (if implemented)

**Why this rule exists**:
- **CSRF Protection**: Inertia.js handles CSRF tokens automatically
- **Error Handling**: Consistent error handling across the application
- **State Management**: Proper page state management and navigation
- **Consistency**: Maintains the SPA experience without page reloads
- **Validation**: Automatic handling of Laravel validation errors

**Pattern to follow**:
```tsx
// ✅ CORRECT - Use Inertia.js
import { router } from '@inertiajs/react';

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  router.post(route('entrers.store'), formData, {
    onSuccess: () => {
      toast.success('Success!');
      setOpen(false);
    },
    onError: (errors) => {
      setErrors(errors);
      toast.error('Error occurred');
    },
    onFinish: () => {
      setProcessing(false);
    },
    preserveScroll: true,
  });
};

// ❌ WRONG - Don't use fetch for form submissions
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const response = await fetch(route('entrers.store'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  // This causes CSRF issues and inconsistent behavior
};
```

### Data Flow Pattern
```
User Action → React Component → Inertia Form → Laravel Controller → Model → Database
Database → Model → Controller → Inertia Response → React Component → UI Update
```

## Database Design Patterns

### Entity Relationships
```
Users (1:1) Commercial
Commercial (1:n) Clients
Clients (n:1) Ville
Ville (n:1) Secteur
Products (n:1) Brand
Products (n:1) Category
```

### Naming Conventions
- **Tables**: Plural snake_case (`commerciaux`, `clients`, `products`)
- **Models**: Singular PascalCase (`Commercial`, `Client`, `Product`)
- **Foreign Keys**: Singular with `_id` suffix (`commercial_id`, `ville_id`)

### Migration Strategy
- Sequential migrations with proper dependency order
- Unique constraints for business-critical fields
- Proper foreign key relationships with cascading rules

## Component Architecture Patterns

### Page Structure
```
resources/js/pages/[entity]/
├── index.tsx           # Main page component
├── AppTable.tsx        # Table wrapper with search/filter
├── components/
│   ├── [Entity]Table.tsx       # Data table
│   ├── [Entity]Dialog.tsx      # Create dialog
│   ├── [Entity]EditDialog.tsx  # Edit dialog
│   ├── [Entity]DropDown.tsx    # Action dropdown
│   └── PaginationSelection.tsx # Pagination controls
└── config/
    └── columns.tsx     # Table column definitions
```

### Reusable Component Patterns
```
resources/js/components/patterns/
├── README.md              # Documentation des patterns
└── ProtectedCombobox.tsx  # Combobox sécurisé avec protection d'événements
```

**Patterns disponibles**:
- **ProtectedCombobox**: Combobox avec protection complète contre la propagation d'événements
  - **Emplacement**: `resources/js/components/patterns/ProtectedCombobox.tsx`
  - **Documentation**: `resources/js/components/patterns/README.md`
  - **Utilisation obligatoire** pour toutes les sélections dans les modals
  - **Fonctionnalités**:
    - Protection complète contre la propagation d'événements
    - Recherche en temps réel avec filtre sur label et subLabel
    - Gestion des éléments inactifs avec désactivation visuelle
    - Support des sous-labels (ex: références de produits)
    - Interface cohérente avec shadcn/ui
  - **Props**:
    - `items`: Array d'objets avec `id`, `label`, `subLabel?`, `isActive?`
    - `value`: ID de l'élément sélectionné
    - `onValueChange`: Callback appelé lors de la sélection
    - `disabled?`: Désactive le combobox
    - `placeholder?`: Texte affiché quand aucun élément n'est sélectionné
    - `searchPlaceholder?`: Placeholder du champ de recherche
    - `className?`: Classes CSS supplémentaires

## Module Creation Patterns

### 1. Index Page Pattern
```tsx
// resources/js/pages/[entity]/index.tsx
"use client";
import AppTable from '@/pages/[entity]/AppTable';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage [Entity]',
        href: '/[entities]',
    },
];

export default function Index({
    // Props from controller
}: {
    // Type definitions
}) {
    const [isLoad, setIsLoad] = useState(false);

    useEffect(() => {
        setIsLoad(true);
    }, []);

    if (!isLoad) return null;

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={true}
                gutter={8}
                toastOptions={{
                    className: '',
                    duration: 4000,
                    removeDelay: 1000,
                    style: {
                        border: '1px solid #713200',
                        padding: '16px',
                        color: '#713200',
                    },
                }}
            />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="[Entity]" />
                <div className="poppins p-5 border w-full min-h-screen">
                    <Card className='flex flex-col shadow-none p-5'>
                        <AppTable />
                    </Card>
                </div>
            </AppLayout>
        </>
    );
}
```

### 2. AppTable Pattern
```tsx
// resources/js/pages/[entity]/AppTable.tsx
"use client";
import { usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import [Entity]Dialog from "./components/[Entity]Dialog";
import { columns } from "./config/columns";
import { [Entity]Table } from "./components/[Entity]Table";
import type { [Entity] } from "./config/columns";
import { useEffect } from "react";

export default function AppTable() {
    const { props: { [entities] } } = usePage();
    const [entities]Array = [entities] as [Entity][];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                document.getElementById('add-[entity]-button')?.click();
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
                        <CardTitle className="font-bold text-lg sm:text-xl md:text-2xl">[Entity]</CardTitle>
                        <p className="text-muted-foreground text-sm md:text-base">
                            {[entities]Array.length} {[entities]Array.length > 1 ? "[Entities]" : "[Entity]"}
                        </p>
                    </div>
                    <div className="w-full md:w-auto">
                        <[Entity]Dialog />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-1 sm:p-2 md:p-4 w-full overflow-x-auto">
                <div className="min-w-[300px]">
                    <[Entity]Table data={[entities] as [Entity][]} columns={columns} />
                </div>
            </CardContent>
        </Card>
    );
}
```

### 3. Dialog Pattern (Create)
```tsx
// resources/js/pages/[entity]/components/[Entity]Dialog.tsx
"use client";
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/use-permissions';

export default function [Entity]Dialog() {
  const [open, setOpen] = useState(false);
  const { can } = usePermissions();

  const { data, setData, post, errors, reset, processing } = useForm({
    // Form fields
  });

  // Ne pas afficher le bouton si l'utilisateur n'a pas la permission
  if (!can('[entities].create')) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('[entities].store'), {
      onSuccess: () => {
        toast.success('[Entity] créé avec succès!');
        reset();
        setOpen(false);
      },
      onError: () => {
        toast.error('Échec de la création du [entity]!');
      },
      preserveScroll: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="add-[entity]-button" className="h-10 w-full sm:w-auto">
          Ajouter un [Entity]
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] max-w-[800px] max-h-[95vh] overflow-y-auto p-4 sm:p-6 sm:max-w-[800px] md:p-7 md:px-8 poppins"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl md:text-[22px] text-center sm:text-left">
            Ajouter un [Entity]
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-center sm:text-left">
            Remplissez le formulaire pour ajouter un nouveau [entity]
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="w-full sm:w-auto"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. DropDown Pattern
```tsx
// resources/js/pages/[entity]/components/[Entity]DropDown.tsx
"use client";
import React, { useState } from "react";
import { Row } from "@tanstack/react-table";
import { [Entity] } from "@/pages/[entity]/config/columns";

import { FaRegEdit } from "react-icons/fa";
import { MdContentCopy, MdOutlineDelete } from "react-icons/md";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import [Entity]EditDialog from "@/pages/[entity]/components/[Entity]EditDialog";
import { usePermissions } from '@/hooks/use-permissions';

type MenuItem =
  | {
      icon: React.ReactElement;
      label: string;
      className: string;
      separator?: false | undefined;
      id?: string | undefined;
    }
  | {
      separator: true;
      icon?: undefined;
      label?: undefined;
      className?: undefined;
    };

export default function [Entity]DropDown({ row }: { row: Row<[Entity]> }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { delete: destroy } = useForm();
  const { can } = usePermissions();

  function handleEdit() {
    setIsDropdownOpen(false);
    setTimeout(() => {
      setIsEditDialogOpen(true);
    }, 100);
  }

  async function handleDelete() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce [entity] ?')) {
      destroy(route('[entities].destroy', { [entity]: row.original.id }), {
        onSuccess: () => {
          toast.success('[Entity] supprimé avec succès');
        },
        onError: () => {
          toast.error('Erreur lors de la suppression du [entity]');
        },
        preserveScroll: true,
      });
    }
  }

  async function handleCopy() {
    if (confirm('Êtes-vous sûr de vouloir faire une copie de ce [entity] ?')) {
      // Copy logic
      router.post(route('[entities].store'), {
        // Copy data
      }, {
        onSuccess: () => {
          toast.success('[Entity] copié avec succès');
        },
        onError: (errors) => {
          console.error('Erreurs lors de la copie:', errors);
          toast.error('Erreur lors de la copie du [entity]');
        },
        preserveScroll: true,
      });
    }
  }

  function handleClickedItem(item: MenuItem) {
    if (item.label === "Delete") {
      setIsDropdownOpen(false);
      setTimeout(() => {
        handleDelete();
      }, 100);
    }

    if (item.label === "Copy") {
      setIsDropdownOpen(false);
      setTimeout(() => {
        handleCopy();
      }, 100);
    }

    if (item.label === "Edit") {
      handleEdit();
    }
  }

  const menuItems: MenuItem[] = [
    ...(can('[entities].create') ? [{ icon: <MdContentCopy />, label: "Copy", className: "" }] : []),
    ...(can('[entities].edit') ? [{ icon: <FaRegEdit />, label: "Edit", className: "" }] : []),
    ...(((can('[entities].create') || can('[entities].edit')) && can('[entities].delete')) ? [{ separator: true } as const] : []),
    ...(can('[entities].delete') ? [{ icon: <MdOutlineDelete className="text-lg" />, label: "Delete", className: "text-red-600" }] : [])
  ];

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <div>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="poppins">
          {menuItems.map((item, index) =>
            item.separator ? (
              <DropdownMenuSeparator key={index} />
            ) : (
              <DropdownMenuItem
                key={index}
                className={`flex items-center gap-1 p-[10px] ${item.className}`}
                onClick={() => handleClickedItem(item)}
                onSelect={(e) => {
                  if (item.label === "Edit") {
                    e.preventDefault();
                  }
                }}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <[Entity]EditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        [entity]={row.original}
      />
    </div>
  );
}
```

### 5. Table Pattern
```tsx
// resources/js/pages/[entity]/components/[Entity]Table.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { IoClose } from "react-icons/io5";
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
  useReactTable,
  FilterFn,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import PaginationSelection from "@/pages/[entity]/components/PaginationSelection";
import { Badge } from "@/components/ui/badge";
import { [Entity]DropDown } from "./[Entity]DropDown";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export type PaginationType = {
  pageIndex: number;
  pageSize: number;
};

export function [Entity]Table<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 8,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setSorting([
      {
        id: "created_at",
        desc: true,
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
  });

  return (
    <div className="poppins">
      <div className="flex flex-col gap-3 mb-8 mt-6">
        <div className="flex items-center justify-between">
          <Input
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn("name")?.setFilterValue(event.target.value);
            }}
            placeholder="Rechercher..."
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
                <TableRow
                  key={row.id}
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
```

### 6. Columns Configuration Pattern
```tsx
// resources/js/pages/[entity]/config/columns.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { [Entity]DropDown } from "../components/[Entity]DropDown";

export type [Entity] = {
  id: number;
  name: string;
  // Other fields
  created_at: string;
  updated_at: string;
};

export const columns: ColumnDef<[Entity]>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  // Other columns...
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <[Entity]DropDown row={row} />;
    },
  },
];
```

### Form Management Pattern
- Use `useForm()` from Inertia for all forms
- Validation handled server-side with FormRequest classes
- Error display through `InputError` components
- Consistent submit/cancel button patterns

### Permission Pattern
- Role-based permissions via spatie/laravel-permission
- Permission checks in controllers using policies
- Frontend permission visibility using `usePermissions()` hook
- Consistent permission naming: `[entity].[action]` (e.g., `client.create`)

## UI/UX Patterns

### Design System
- **Components**: shadcn/ui as base, customized for brand
- **Styling**: TailwindCSS utilities only, no custom CSS
- **Icons**: Lucide React with consistent sizing
- **Colors**: Neutral palette with accent colors for actions

### Navigation Pattern
```
AppShell
├── AppSidebar (collapsible navigation)
├── AppHeader (breadcrumbs, user menu)
└── AppContent (page content)
```

### Table Interaction Pattern
1. **Search**: Global search across relevant fields
2. **Sort**: Click column headers for sorting
3. **Actions**: Dropdown menu for row actions
4. **Create**: Dialog modal from page header
5. **Edit**: Dialog modal from row actions
6. **Delete**: Confirmation dialog with soft delete

### Modal Pattern
- Create/Edit operations use dialog modals
- Form state managed by Inertia's `useForm()`
- Consistent button layout: Cancel (left) / Save (right)
- Auto-close on successful submission

### Dialog Accessibility Pattern
```tsx
// Non-modal dialogs to prevent focus conflicts with dropdowns
<Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
  <DialogContent onInteractOutside={e => e.preventDefault()}>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description for accessibility</DialogDescription>
    </DialogHeader>
    {/* Form content */}
  </DialogContent>
</Dialog>
```

### Select/Combobox Pattern
```tsx
// Standard Select component with proper accessibility
<Select value={data.field} onValueChange={(value) => setData('field', value)}>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionner..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Pagination Pattern (Mise à jour 2024)

### Backend (Laravel)
- Utiliser la méthode paginate($perPage) dans le contrôleur, où $perPage est récupéré dynamiquement depuis la query string (ex : $request->get('perPage', 8)).
- Transmettre l'objet paginé (avec data, links, meta, etc.) à la vue Inertia.
- Les filtres (search, sort, direction, perPage, page) sont transmis et mémorisés dans la query string pour permettre la navigation et la mémorisation de l'état.

### Frontend (React/Inertia)
- Le composant React gère la pagination locale (page courante, nombre de lignes par page) et envoie ces paramètres au backend via Inertia lors de chaque changement (router.get(..., { perPage, page, ... })).
- Le composant PaginationSelection permet de choisir dynamiquement le nombre de lignes par page (8, 16, 32, 64, All).
- La navigation (précédent, suivant, première, dernière page) recharge la page avec les bons paramètres.
- L'état de la pagination est synchronisé entre le frontend et le backend pour garantir une UX cohérente et une gestion performante des grands volumes de données.

### Harmonisation
- Ce pattern est appliqué à tous les modules paginés (clients, stocks, produits, etc.) pour garantir la cohérence et la maintenabilité du projet.

### Filter with Search Pattern
```tsx
// Multi-select filter with search functionality
export function FilterWithSearch({
  selectedItems,
  setSelectedItems,
  items,
  icon,
  label,
  searchPlaceholder,
}: FilterProps) {
  const [open, setOpen] = React.useState(false);

  function handleCheckboxChange(itemId: string) {
    setSelectedItems((prev) => {
      const updatedItems = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      return updatedItems;
    });
  }

  function clearFilters() {
    setSelectedItems([]);
  }

  return (
    <div className="flex items-center space-x-4 poppins">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" className="h-10">
            {icon}
            {label}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-64 poppins" side="bottom" align="center">
          <Command className="p-1">
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty className="text-slate-500 text-sm text-center p-5">
                Aucun résultat trouvé.
              </CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    className="h-10 mb-2 flex items-center cursor-pointer"
                    key={item.id}
                    value={item.name}
                    onSelect={() => handleCheckboxChange(item.id)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleCheckboxChange(item.id)}
                        className="size-4 rounded-[4px] mr-2"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="flex flex-col gap-2 text-[23px]">
              <Separator />
              <Button variant="ghost" className="text-[12px] mb-1" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Filter Area Component for displaying selected items
function FilterArea({
  selectedItems,
  setSelectedItems,
  items,
  label,
}: {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  items: any[];
  label: string;
}) {
  return (
    <div className="flex gap-3 poppins">
      {selectedItems.length > 0 && (
        <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
          <span className="text-gray-600">{label}</span>
          <Separator orientation="vertical" />
          <div className="flex gap-2 items-center">
            {selectedItems.length < 3 ? (
              <>
                {selectedItems.map((itemId, index) => {
                  const item = items.find(i => i.id.toString() === itemId);
                  return (
                    <Badge key={index} variant={"secondary"}>
                      {item?.name || itemId}
                    </Badge>
                  );
                })}
              </>
            ) : (
              <>
                <Badge variant={"secondary"}>{selectedItems.length} Selected</Badge>
              </>
            )}
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <Button
          onClick={() => setSelectedItems([])}
          variant={"ghost"}
          className="p-1 px-2"
        >
          <span>Reset</span>
          <IoClose />
        </Button>
      )}
    </div>
  );
}
```

### Simple Filter Pattern
```tsx
// Multi-select filter without search (for smaller datasets)
export function SimpleFilter({
  selectedItems,
  setSelectedItems,
  items,
  icon,
  label,
}: SimpleFilterProps) {
  const [open, setOpen] = React.useState(false);

  function handleCheckboxChange(itemId: string) {
    setSelectedItems((prev) => {
      const updatedItems = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      return updatedItems;
    });
  }

  function clearFilters() {
    setSelectedItems([]);
  }

  return (
    <div className="flex items-center space-x-4 poppins">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" className="h-10">
            {icon}
            {label}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-64 poppins" side="bottom" align="center">
          <Command className="p-1">
            <CommandList>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    className="h-10 mb-2 flex items-center"
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleCheckboxChange(item.id)}
                  >
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleCheckboxChange(item.id)}
                      className="size-4 rounded-[4px] mr-2"
                    />
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-blue-600">{item.code}</span>
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="flex flex-col gap-2 text-[23px]">
              <Separator />
              <Button variant="ghost" className="text-[12px] mb-1" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Filter Area Component for displaying selected items (same as above)
function FilterArea({
  selectedItems,
  setSelectedItems,
  items,
  label,
}: {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  items: any[];
  label: string;
}) {
  return (
    <div className="flex gap-3 poppins">
      {selectedItems.length > 0 && (
        <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
          <span className="text-gray-600">{label}</span>
          <Separator orientation="vertical" />
          <div className="flex gap-2 items-center">
            {selectedItems.length < 3 ? (
              <>
                {selectedItems.map((itemId, index) => {
                  const item = items.find(i => i.id.toString() === itemId);
                  return (
                    <Badge key={index} variant={"secondary"}>
                      {item?.name || itemId}
                    </Badge>
                  );
                })}
              </>
            ) : (
              <>
                <Badge variant={"secondary"}>{selectedItems.length} Selected</Badge>
              </>
            )}
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <Button
          onClick={() => setSelectedItems([])}
          variant={"ghost"}
          className="p-1 px-2"
        >
          <span>Reset</span>
          <IoClose />
        </Button>
      )}
    </div>
  );
}
```

## Security Patterns

### Authentication Flow
1. Laravel Breeze handles auth UI and logic
2. Sanctum provides CSRF protection for SPA
3. Middleware protects all authenticated routes
4. Session-based authentication for web routes

### Authorization Pattern
```php
// Controller pattern
public function store(ClientRequest $request)
{
    $this->authorize('create', Client::class);
    // ... create logic
}

// Policy pattern
public function create(User $user): bool
{
    return $user->hasPermissionTo('client.create');
}
```

### Data Validation
- Server-side validation via FormRequest classes
- Client-side validation through form state
- Sanitization in FormRequest rules
- Database constraints as final safety net

## State Management Patterns

### Page State
- Server state via Inertia props (no client-side caching)
- Form state via `useForm()` hook
- UI state via React `useState()` for local interactions
- Global state via Zustand only when absolutely necessary

### Search & Filter State
- URL-based state for shareable/bookmarkable results
- Server-side processing for performance
- Debounced search input to reduce requests
- Pagination state maintained in URL parameters

## Error Handling Patterns

### Backend Errors
- FormRequest validation with detailed messages
- Custom exceptions for business logic errors
- Proper HTTP status codes
- Structured error responses for API endpoints

### Frontend Errors
- Error boundaries for React component crashes
- Form validation errors displayed inline
- Network error handling with user-friendly messages
- Loading states during async operations

## Performance Patterns

### Database Optimization
- Eager loading for N+1 query prevention
- Database indexing on frequently queried columns
- Pagination for large datasets
- Query scoping for filtered results

### Frontend Optimization
- Code splitting at page level
- Lazy loading of heavy components
- Minimal re-renders through proper React patterns
- Image optimization for UI assets

## Testing Strategy Patterns

### Backend Testing
- Feature tests for controller endpoints
- Unit tests for models and business logic
- Permission tests for authorization
- Database tests with transactions

### Frontend Testing
- Component testing for UI interactions
- Integration testing for form submissions
- Permission-based UI testing
- Accessibility testing for compliance

## Event Propagation Protection Patterns

### ⚠️ CRITICAL: Combobox Event Propagation Protection

**PROBLEM**: Clicks on combobox components can trigger parent form submissions or unwanted actions.

**SOLUTION**: Always add event propagation protection to combobox components.

**Pattern to follow**:
```tsx
// ✅ CORRECT - Protected Combobox Component
function ProductCombobox({ onValueChange, ...props }) {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className="relative"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Button
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {/* Button content */}
      </Button>

      {open && (
        <div 
          className="absolute z-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Input
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
          {/* Dropdown items with existing stopPropagation */}
        </div>
      )}
    </div>
  );
}

// ❌ WRONG - No protection
function ProductCombobox({ onValueChange, ...props }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)} // Missing protection
      >
        {/* Button content */}
      </Button>
      {/* Dropdown without protection */}
    </div>
  );
}
```

**Why this is critical**:
- Prevents accidental form submissions
- Maintains proper UX flow
- Avoids conflicts between interactive elements
- Ensures combobox functionality works as expected

### Modal Event Propagation Protection
```tsx
<DialogContent
  onPointerDownOutside={(e) => e.preventDefault()}
  onInteractOutside={(e) => e.preventDefault()}
  onClick={(e) => e.stopPropagation()}
>
```

### Table Row Event Protection
```tsx
onClick={(e) => {
  e.stopPropagation();
  // logique de clic
}}
``` 

# Protocoles de migration/refactorisation senior

## 1. Migration unique et suppression stricte
- Lorsqu’un dossier/fichier est déplacé ou renommé, l’original doit être supprimé immédiatement après la migration effective et la vérification de bon fonctionnement.
- Il ne doit jamais exister deux versions concurrentes d’un même module dans le projet.

## 2. Vérification des références
- Après tout déplacement/renommage, effectuer une recherche globale sur :
  - Les imports (ex : `@/pages/ancien_nom`, `@/pages/nouveau_nom`)
  - Les routes (web, API, Inertia, etc.)
  - Les configurations (Vite, Inertia, alias, etc.)
  - Les contrôleurs et vues qui pourraient référencer l’ancien chemin
- Aucune référence à l’ancien chemin ne doit subsister.

## 3. Suppression stricte
- La suppression du dossier/fichier d’origine doit être totale (fichiers, sous-dossiers, et dossier parent si vide).
- Si le système de fichiers bloque la suppression, l’utilisateur doit être alerté pour une suppression manuelle.

## 4. Vérification post-migration
- Après migration et suppression :
  - Relancer le build/dev-server
  - Vérifier l’absence d’erreurs “Page not found”, “Module not found”, ou équivalent dans la console
  - Tester la navigation vers la fonctionnalité migrée

## 5. Documentation de la migration
- Toute migration doit être documentée dans le fichier `memory-bank/activeContext.md` :
  - Date, motif, modules concernés, chemins avant/après, vérifications effectuées.

## 6. Rollback rapide
- En cas d’erreur, prévoir un plan de rollback (sauvegarde temporaire du dossier avant suppression définitive).

## 7. Approche senior systématique
- Toujours lire la mémoire du projet avant toute action.
- Exposer le plan d’action avant toute modification majeure.
- Communiquer chaque étape et chaque correction apportée.
- Documenter systématiquement toute action structurante. 

## Testing Patterns

### ⚠️ CRITICAL: Always Use Temporary Files for Testing
- **Problem** : PowerShell escape character issues with complex commands
- **Solution** : Create temporary PHP files for isolated testing
- **Pattern** : `test_filename.php` → execute → delete
- **Example** : `test_sortie_complete.php` for complex logic testing

### 🚀 OPTIMIZED: Factory + Real Data for Maximum Performance
- **Problem** : Seeders are slow for large datasets (50.01s)
- **Solution** : Use Factory with real data extracted from seeders
- **Pattern** : `Model::factory()->create()` with real data
- **Example** : `Ville::factory()->create()` with real Moroccan cities
- **Performance** : 93% faster (3.70s vs 50.01s)
- **Advantages** :
  - ⚡ **Ultra-fast execution** : No need to load full seeders
  - 🎯 **Targeted testing** : Only create what's needed
  - 📝 **Easy maintenance** : Simple to modify test data
  - ✅ **Real data** : Extracted from existing seeders

### 🏭 Factory Creation Pattern
```php
// ✅ OPTIMIZED FACTORY PATTERN
class VilleFactory extends Factory
{
    public function definition(): array
    {
        // Real data extracted from VilleSeeder
        $realVilles = ['INZEGANE', 'AGADIR', 'CASABLANCA', ...];
        
        return [
            'nameVille' => $this->faker->unique()->randomElement($realVilles),
        ];
    }
}
```

### 🚨 CRITICAL: Never Use User::factory() in Tests
- **Rule** : Never use `User::factory()` in tests
- **Reason** : Permission and consistency issues
- **Solution** : Use existing user or create specific user
- **Pattern** : `User::where('email', 'superadmin@admin.com')->first()`

### 📝 CRITICAL: Never Modify Existing Business Code
- **Rule** : Never modify routes, controllers, frontend, or events for tests
- **Goal** : Create ONLY tests
- **Pattern** : Test existing code without modifying it

### 🗄️ CRITICAL: Never Modify Other Tables (Only Target Table)
- **Rule** : Never modify other tables than the one concerned by the test
- **Goal** : Isolated and independent tests
- **Pattern** : Use `DatabaseTransactions` for automatic rollback
- **Example** : Test `Ville` → only touch `villes` table
- **Advantage** : Avoid side effects and conflicts between tests

### 🎯 Optimized Test Structure Pattern
```php
#[Test] // PHPUnit 12 attributes (no warnings)
public function test_name()
{
    // ✅ OPTIMIZED: Factory + Real Data (3.70s)
    $user = User::where('email', 'superadmin@admin.com')->first();
    $ville = Ville::factory()->create(); // Real Moroccan city
    
    // Test logic
    $response = $this->actingAs($user)->get('/route');
    
    // Assertions
    $response->assertStatus(200);
}
```

### 📊 Performance Comparison
| Approach | Duration | Improvement |
|----------|----------|-------------|
| **Full Seeders** | 50.01s | - |
| **Factory + Seeders** | 25.19s | 50% faster |
| **Factory Only** | **3.70s** | **93% faster** |

### 🔄 Factory Requirements
- ✅ **VilleFactory** - Real Moroccan cities
- ✅ **UserFactory** - Fixed super admin credentials
- 🔄 **SecteurFactory** - Real sectors with ville relations
- 🔄 **ClientFactory** - Real clients with all relations
- 🔄 **CommercialFactory** - Real commercials

### 📋 Test Creation Checklist
- [ ] Consult project memory
- [ ] Identify entity to test
- [ ] Check required permissions
- [ ] Create complete CRUD tests
- [ ] Add validation tests
- [ ] Add permission tests
- [ ] Verify performance (< 5s total)
- [ ] Update documentation

### 🎯 Performance Goals
- **Individual test** : < 1 second
- **Complete suite** : < 10 seconds
- **Code coverage** : > 90%
- **Assertions** : At least 3 per test 
