"use client";
import type { ColumnDef } from "@tanstack/react-table";
import PromotionTableBase from "@/pages/promotion/shared/components/PromotionTableBase";

export function PromotionTable<TData, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}) {
  return <PromotionTableBase columns={columns} data={data} />;
}


