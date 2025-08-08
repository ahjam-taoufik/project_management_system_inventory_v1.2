import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/dialogs';
import { Trash2, Edit, Save, AlertTriangle } from 'lucide-react';

// Exemple d'utilisation du ConfirmDialog dans différents contextes
export function ExampleUsage() {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const handleDelete = () => {
        console.log('Suppression effectuée');
        // Logique de suppression ici
    };

    const handleSave = () => {
        console.log('Sauvegarde effectuée');
        // Logique de sauvegarde ici
    };

    return (
        <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">Exemples d'utilisation de ConfirmDialog</h2>

            {/* Exemple 1: Dialogue de suppression */}
            <div className="border p-4 rounded-lg">
                <h3 className="font-semibold mb-2">1. Dialogue de suppression</h3>
                <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Supprimer l'élément
                </Button>

                <ConfirmDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    title="Confirmer la suppression"
                    description="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
                    type="warning"
                    confirmText="Supprimer"
                    cancelText="Annuler"
                    confirmVariant="destructive"
                    onConfirm={handleDelete}
                />
            </div>

            {/* Exemple 2: Dialogue de sauvegarde */}
            <div className="border p-4 rounded-lg">
                <h3 className="font-semibold mb-2">2. Dialogue de sauvegarde</h3>
                <Button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                </Button>

                <ConfirmDialog
                    open={showSaveDialog}
                    onOpenChange={setShowSaveDialog}
                    title="Sauvegarder les modifications"
                    description="Voulez-vous sauvegarder les modifications apportées à ce document ?"
                    type="info"
                    confirmText="Sauvegarder"
                    cancelText="Annuler"
                    onConfirm={handleSave}
                />
            </div>

            {/* Exemple 3: Dialogue d'avertissement */}
            <div className="border p-4 rounded-lg">
                <h3 className="font-semibold mb-2">3. Dialogue d'avertissement</h3>
                <Button
                    variant="outline"
                    onClick={() => setShowWarningDialog(true)}
                    className="flex items-center gap-2"
                >
                    <AlertTriangle className="w-4 h-4" />
                    Afficher l'avertissement
                </Button>

                <ConfirmDialog
                    open={showWarningDialog}
                    onOpenChange={setShowWarningDialog}
                    title="Attention"
                    description="Cette action peut avoir des conséquences importantes. Assurez-vous d'avoir sauvegardé vos données avant de continuer."
                    type="warning"
                    confirmText="Continuer"
                    cancelText="Annuler"
                />
            </div>

            {/* Exemple 4: Dialogue de succès (sans bouton d'annulation) */}
            <div className="border p-4 rounded-lg">
                <h3 className="font-semibold mb-2">4. Dialogue de succès</h3>
                <Button
                    variant="outline"
                    onClick={() => setShowSuccessDialog(true)}
                >
                    Simuler un succès
                </Button>

                <ConfirmDialog
                    open={showSuccessDialog}
                    onOpenChange={setShowSuccessDialog}
                    title="Opération réussie"
                    description="L'élément a été créé avec succès. Vous pouvez maintenant continuer avec d'autres actions."
                    type="success"
                    confirmText="OK"
                    showCancel={false}
                />
            </div>
        </div>
    );
}

// Hook personnalisé pour faciliter l'utilisation
export function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        description: '',
        type: 'warning' as const,
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        onConfirm: () => {},
        onCancel: () => {},
    });

    const showDialog = (dialogConfig: typeof config) => {
        setConfig(dialogConfig);
        setIsOpen(true);
    };

    const hideDialog = () => {
        setIsOpen(false);
    };

    const ConfirmDialogComponent = () => (
        <ConfirmDialog
            open={isOpen}
            onOpenChange={setIsOpen}
            {...config}
        />
    );

    return {
        showDialog,
        hideDialog,
        ConfirmDialogComponent,
    };
}

// Exemple d'utilisation avec le hook
export function ExampleWithHook() {
    const { showDialog, ConfirmDialogComponent } = useConfirmDialog();

    const handleDeleteWithHook = () => {
        showDialog({
            title: 'Supprimer l\'élément',
            description: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
            type: 'warning',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            onConfirm: () => {
                console.log('Suppression confirmée via hook');
            },
        });
    };

    return (
        <div className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Utilisation avec hook personnalisé</h3>
            <Button
                variant="destructive"
                onClick={handleDeleteWithHook}
            >
                Supprimer avec hook
            </Button>

            <ConfirmDialogComponent />
        </div>
    );
}
