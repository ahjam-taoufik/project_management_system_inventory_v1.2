"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Archive } from "lucide-react";

type ArchivedFilterProps = {
    showArchived: boolean;
    setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
    label?: string;
    icon?: React.ReactNode;
};

export function ArchivedFilter({
    showArchived,
    setShowArchived,
    label = "Archivées",
    icon = <Archive className="h-4 w-4" />,
}: ArchivedFilterProps) {
    const [open, setOpen] = React.useState(false);

    function handleToggle() {
        setShowArchived(!showArchived);
    }

    function clearFilters() {
        setShowArchived(false);
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
                <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="archived-mode"
                                checked={showArchived}
                                onCheckedChange={handleToggle}
                            />

                        </div>

                        <div className="text-xs text-gray-500">
                            {showArchived
                                ? "Affiche tout"
                                : "Affiche non archivées"
                            }
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-xs"
                            >
                                Clear Filter
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
