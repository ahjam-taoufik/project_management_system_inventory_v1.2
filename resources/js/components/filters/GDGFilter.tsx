"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandInput,
} from "@/components/ui/command";
import { Users } from "lucide-react";

type GDGFilterProps = {
    selectedGDG: string[];
    setSelectedGDG: React.Dispatch<React.SetStateAction<string[]>>;
    sorties?: Array<{ id: number; client_gdg: number; client: { id: number; code: string; fullName?: string } }>;
    label?: string;
    icon?: React.ReactNode;
};

export function GDGFilter({
    selectedGDG,
    setSelectedGDG,
    sorties = [],
    label = "G/DG",
    icon = <Users className="h-4 w-4" />,
}: GDGFilterProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    function handleCheckboxChange(value: string) {
        setSelectedGDG((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value);
            } else {
                return [...prev, value];
            }
        });
    }

    function clearFilters() {
        setSelectedGDG([]);
        setSearchValue("");
    }

    // Extraire les valeurs uniques de pourcentage et les grouper
    const gdgOptions = React.useMemo(() => {
        const options = new Map<string, { label: string; count: number; clients: Array<{ id: number; code: string; fullName?: string }> }>();

        sorties.forEach((sortie) => {
            const clientGDG = sortie.client_gdg || 0;
            const key = clientGDG.toString();

            if (!options.has(key)) {
                let label: string;
                if (clientGDG > 0) {
                    label = `G/DG +${clientGDG}%`;
                } else if (clientGDG < 0) {
                    label = `G/DG ${clientGDG}%`;
                } else {
                    label = "G/DG 0%";
                }
                options.set(key, { label, count: 0, clients: [] });
            }

            const option = options.get(key)!;
            option.count++;
            option.clients.push({ id: sortie.client.id, code: sortie.client.code, fullName: sortie.client.fullName });
        });

        return Array.from(options.entries()).map(([value, data]) => ({
            value,
            ...data
        })).sort((a, b) => {
            // Trier par valeur décroissante : positif > 0 > négatif
            const aValue = parseInt(a.value);
            const bValue = parseInt(b.value);
            return bValue - aValue;
        });
    }, [sorties]);

    const filteredOptions = React.useMemo(() => {
        if (!searchValue) return gdgOptions;
        return gdgOptions.filter((option) => {
            const searchLower = searchValue.toLowerCase();
            return option.label.toLowerCase().includes(searchLower) ||
                   option.clients.some(client =>
                       (client.code || '').toLowerCase().includes(searchLower) ||
                       (client.fullName || '').toLowerCase().includes(searchLower)
                   );
        });
    }, [gdgOptions, searchValue]);

    return (
        <div className="flex items-center space-x-4 poppins">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="secondary" className="h-10">
                        {icon}
                        {label}
                        {selectedGDG.length > 0 && (
                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                {selectedGDG.length}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Rechercher un G/DG..."
                            value={searchValue}
                            onValueChange={setSearchValue}
                        />
                        <CommandEmpty>Aucun G/DG trouvé.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    className="h-auto mb-2 flex items-start cursor-pointer"
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleCheckboxChange(option.value)}
                                >
                                    <div
                                        className="flex items-start w-full"
                                        onClick={() => handleCheckboxChange(option.value)}
                                    >
                                        <Checkbox
                                            checked={selectedGDG.includes(option.value)}
                                            onCheckedChange={() => handleCheckboxChange(option.value)}
                                            className="size-4 rounded-[4px] mr-2 mt-0.5"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex flex-col text-sm flex-1">
                                            <span className="font-medium text-blue-600 cursor-pointer hover:text-blue-800">
                                                {option.label}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {option.count} client(s)
                                            </span>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                    <div className="flex items-center justify-between p-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-xs"
                        >
                            Clear Filters
                        </Button>
                        <span className="text-xs text-gray-500">
                            {selectedGDG.length} sélectionné(s)
                        </span>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
