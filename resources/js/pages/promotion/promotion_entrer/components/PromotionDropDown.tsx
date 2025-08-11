"use client";
import { Row } from "@tanstack/react-table";
import type { Promotion } from "@/pages/promotion/shared/types";
import ActionsDropDownBase from "@/pages/promotion/shared/components/ActionsDropDownBase";
import PromotionEditDialog from "@/pages/promotion/promotion_entrer/components/PromotionEditDialog";

export default function PromotionDropDown({ row }: { row: Row<Promotion> }) {
  return (
    <ActionsDropDownBase
      row={row}
      permissionPrefix="promotions_entrer"
      routePrefix="promotions-entrer"
      EditDialog={PromotionEditDialog}
    />
  );
}


