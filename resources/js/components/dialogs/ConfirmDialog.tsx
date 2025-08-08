import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";

export interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    type?: "warning" | "error" | "info" | "success";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
}

const iconMap = {
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
    success: CheckCircle,
};

const colorMap = {
    warning: "text-yellow-600",
    error: "text-red-600",
    info: "text-blue-600",
    success: "text-green-600",
};

const buttonColorMap = {
    warning: "bg-yellow-600 hover:bg-yellow-700",
    error: "bg-red-600 hover:bg-red-700",
    info: "bg-blue-600 hover:bg-blue-700",
    success: "bg-green-600 hover:bg-green-700",
};

export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    type = "warning",
    confirmText = "Confirmer",
    cancelText = "Annuler",
    onConfirm,
    onCancel,
    showCancel = true,
}: ConfirmDialogProps) {
    const IconComponent = iconMap[type];
    const titleColor = colorMap[type];
    const buttonColor = buttonColorMap[type];

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onOpenChange(false);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className={`flex items-center gap-2 ${titleColor}`}>
                        <IconComponent className="w-5 h-5" />
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {showCancel && (
                        <AlertDialogCancel onClick={handleCancel}>
                            {cancelText}
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={buttonColor}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
