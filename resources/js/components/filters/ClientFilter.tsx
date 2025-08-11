"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Search } from "lucide-react";

type ClientFilterProps = {
    selectedClients: string[];
    setSelectedClients: React.Dispatch<React.SetStateAction<string[]>>;
    clients: Client[];
    label?: string;
    icon?: React.ReactNode;
};

type Client = {
    id: number;
    code: string;
    fullName?: string;
    telephone?: string;
    ville?: string | { id: number; nameVille: string; created_at: string; updated_at: string };
    secteur?: string | { id: number; nameSecteur: string; created_at: string; updated_at: string };
    type_client?: string;
    idCommercial?: number;
    remise_special?: number;
    pourcentage?: number;
};

export function ClientFilter({
    selectedClients,
    setSelectedClients,
    clients = [],
    label = "Client",
    icon = <Search className="h-4 w-4" />,
}: ClientFilterProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    function handleCheckboxChange(clientId: string) {
        setSelectedClients((prev) => {
            const updated = prev.includes(clientId)
                ? prev.filter((id) => id !== clientId)
                : [...prev, clientId];

            return updated;
        });
    }

    function clearFilters() {
        setSelectedClients([]);
        setSearchValue("");
    }

    const filteredClients = React.useMemo(() => {
        if (!searchValue) return clients;

        return clients.filter((client) => {
            const searchLower = searchValue.toLowerCase();
            const codeMatch = (client.code || '').toLowerCase().includes(searchLower);
            const nameMatch = (client.fullName || '').toLowerCase().includes(searchLower);
            return codeMatch || nameMatch;
        });
    }, [clients, searchValue]);

    return (
        <div className="flex items-center space-x-4 poppins">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="secondary" className="h-10">
                        {icon}
                        {label}
                        {selectedClients.length > 0 && (
                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                {selectedClients.length}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Rechercher un client..."
                            value={searchValue}
                            onValueChange={setSearchValue}
                        />
                        <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {filteredClients
                                .sort((a, b) => (a.code || '').localeCompare(b.code || ''))
                                .map((client) => (
                                    <CommandItem
                                        className="h-10 mb-2 flex items-center cursor-pointer"
                                        key={client.id}
                                        value={client.code || client.fullName || ''}
                                        onSelect={() => handleCheckboxChange(client.id.toString())}
                                    >
                                        <div
                                            className="flex items-center w-full"
                                            onClick={() => handleCheckboxChange(client.id.toString())}
                                        >
                                            <Checkbox
                                                checked={selectedClients.includes(client.id.toString())}
                                                onCheckedChange={() => handleCheckboxChange(client.id.toString())}
                                                className="size-4 rounded-[4px] mr-2"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex flex-col text-sm">
                                                <span
                                                    className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCheckboxChange(client.id.toString());
                                                    }}
                                                >
                                                    {client.fullName || 'Sans nom'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {client.code || 'Sans code'}
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
                            {selectedClients.length} sélectionné(s)
                        </span>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
