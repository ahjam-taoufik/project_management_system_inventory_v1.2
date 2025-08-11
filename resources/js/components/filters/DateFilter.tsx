"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DateFilterProps = {
    selectedDates: string[];
    setSelectedDates: React.Dispatch<React.SetStateAction<string[]>>;
    label?: string;
    icon?: React.ReactNode;
};

export function DateFilter({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedDates,
    setSelectedDates,
    label = "Date BL",
    icon = <CalendarIcon className="h-4 w-4" />,
}: DateFilterProps) {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date>();
    const [selectedMonths, setSelectedMonths] = React.useState<string[]>([]);
    const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2020 + 11 }, (_, i) => (2020 + i).toString());

    const months = [
        { value: "01", label: "Janvier" },
        { value: "02", label: "Février" },
        { value: "03", label: "Mars" },
        { value: "04", label: "Avril" },
        { value: "05", label: "Mai" },
        { value: "06", label: "Juin" },
        { value: "07", label: "Juillet" },
        { value: "08", label: "Août" },
        { value: "09", label: "Septembre" },
        { value: "10", label: "Octobre" },
        { value: "11", label: "Novembre" },
        { value: "12", label: "Décembre" },
    ];

    function handleDateSelect(selectedDate: Date | undefined) {
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`; // Format YYYY-MM-DD

            setSelectedDates((prev) => {
                const updatedDates = prev.includes(dateString)
                    ? prev.filter((date) => date !== dateString)
                    : [...prev, dateString];

                return updatedDates;
            });
            setDate(undefined); // Reset calendar
        }
    }

    function handleMonthToggle(monthValue: string) {
        setSelectedMonths((prev) => {
            const updated = prev.includes(monthValue)
                ? prev.filter((m) => m !== monthValue)
                : [...prev, monthValue];

            updateSelectedDates(updated, selectedYear);
            return updated;
        });
    }

    function handleYearChange(year: string) {
        setSelectedYear(year);
        updateSelectedDates(selectedMonths, year);
    }

    function updateSelectedDates(months: string[], year: string) {
        const allDates: string[] = [];
        months.forEach((month) => {
            const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const dayStr = String(day).padStart(2, '0');
                allDates.push(`${year}-${month}-${dayStr}`);
            }
        });

        setSelectedDates(allDates);
    }

    function clearFilters() {
        setSelectedDates([]);
        setSelectedMonths([]);
        setSelectedYear(new Date().getFullYear().toString());
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
                <PopoverContent className="w-auto p-0" align="start">
                    <Tabs defaultValue="date" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="date">Date</TabsTrigger>
                            <TabsTrigger value="month">Mois</TabsTrigger>
                        </TabsList>

                        <TabsContent value="date" className="p-3">
                            <div className="text-sm text-gray-600 mb-3">
                                Sélectionnez une ou plusieurs dates spécifiques
                            </div>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                className="rounded-md border"
                            />
                        </TabsContent>

                        <TabsContent value="month" className="p-3">
                            <div className="text-sm text-gray-600 mb-3">
                                Sélectionnez l'année et un ou plusieurs mois
                            </div>

                            <div className="mb-4">
                                <label className="text-sm font-medium mb-2 block">Année</label>
                                <Select value={selectedYear} onValueChange={handleYearChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {months.map((month) => (
                                    <div
                                        key={month.value}
                                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleMonthToggle(month.value)}
                                    >
                                        <Checkbox
                                            checked={selectedMonths.includes(month.value)}
                                            onCheckedChange={() => handleMonthToggle(month.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-sm">{month.label}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Separator />
                    <div className="p-2">
                        <Button
                            variant="ghost"
                            className="w-full text-xs"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
