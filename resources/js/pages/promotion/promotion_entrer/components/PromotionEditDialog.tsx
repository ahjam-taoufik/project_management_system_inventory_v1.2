"use client";
import PromotionEditDialogBase from "@/pages/promotion/shared/components/PromotionEditDialogBase";
import type { Promotion } from "@/pages/promotion/shared/types";

export default function PromotionEditDialog({ isOpen, onOpenChange, promotion }: { isOpen: boolean; onOpenChange: (open: boolean) => void; promotion: Promotion; }) {
  return (
    <PromotionEditDialogBase
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      promotion={promotion}
      permissionPrefix="promotions_entrer"
      routePrefix="promotions-entrer"
    />
  );
}


