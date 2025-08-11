"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList
} from "@/components/ui/command";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

import { HiOutlineUser } from "react-icons/hi";

type Commercial = {
    id: string | number;
    commercial_code: string;
    commercial_fullName: string;
};

type CommercialFilterProps = {
    selectedCommerciaux: string[];
    setSelectedCommerciaux: React.Dispatch<React.SetStateAction<string[]>>;
    commerciaux: Commercial[];
    label?: string;
    icon?: React.ReactNode;
};

export function CommercialFilter({
    selectedCommerciaux,
    setSelectedCommerciaux,
    commerciaux,
    label = "Commercial",
    icon = <HiOutlineUser />,
}: CommercialFilterProps) {
    const [open, setOpen] = React.useState(false);

    function handleCheckboxChange(commercialId: string) {
        setSelectedCommerciaux((prev) => {
            const updatedCommerciaux = prev.includes(commercialId)
                ? prev.filter((id) => id !== commercialId)
                : [...prev, commercialId];

            return updatedCommerciaux;
        });
    }

    function clearFilters() {
        setSelectedCommerciaux([]);
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

                <PopoverContent
                    className="p-0 w-80 poppins"
                    side="bottom"
                    align="center"
                >
                    <Command className="p-1">
                        <CommandList>
                            <CommandGroup>
                                {commerciaux
                                    .sort((a, b) => a.commercial_code.localeCompare(b.commercial_code))
                                    .map((commercial) => (
                                    <CommandItem
                                        className="h-10 mb-2 flex items-center cursor-pointer"
                                        key={commercial.id}
                                        value={commercial.commercial_code}
                                        onSelect={() => handleCheckboxChange(commercial.id.toString())}
                                    >
                                        <div
                                            className="flex items-center w-full"
                                            onClick={() => handleCheckboxChange(commercial.id.toString())}
                                        >
                                            <Checkbox
                                                checked={selectedCommerciaux.includes(commercial.id.toString())}
                                                onCheckedChange={() => handleCheckboxChange(commercial.id.toString())}
                                                className="size-4 rounded-[4px] mr-2"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex flex-col text-sm">
                                                <span
                                                    className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCheckboxChange(commercial.id.toString());
                                                    }}
                                                >
                                                    {commercial.commercial_code}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {commercial.commercial_fullName}
                                                </span>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                        <div className="flex flex-col gap-2 text-[23px]">
                            <Separator />
                            <Button
                                variant="ghost"
                                className="text-[12px] mb-1"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
