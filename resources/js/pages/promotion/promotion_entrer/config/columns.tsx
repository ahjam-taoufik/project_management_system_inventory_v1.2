"use client";
import { ColumnDef } from "@tanstack/react-table";
import { createPromotionColumns } from "@/pages/promotion/shared/config/columnsFactory";
import type { Promotion } from "@/pages/promotion/shared/types";
import PromotionDropDown from "@/pages/promotion/promotion_entrer/components/PromotionDropDown";

export const columns: ColumnDef<Promotion>[] = [
  ...createPromotionColumns({ context: "entrer" }),
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <PromotionDropDown row={row} />;
    },
  },
];


