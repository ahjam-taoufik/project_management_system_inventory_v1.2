# Composants de Dialogue

Ce dossier contient des composants de dialogue réutilisables pour l'application.

## ConfirmDialog

Un composant de dialogue de confirmation réutilisable basé sur AlertDialog.

### Utilisation

```tsx
import { ConfirmDialog } from '@/components/dialogs';

// Dans votre composant
const [showDialog, setShowDialog] = useState(false);

<ConfirmDialog
    open={showDialog}
    onOpenChange={setShowDialog}
    title="Confirmer la suppression"
    description="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
    type="warning"
    confirmText="Supprimer"
    cancelText="Annuler"
    onConfirm={() => {
        // Logique de suppression
        console.log('Suppression confirmée');
    }}
/>
```

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `open` | `boolean` | - | État d'ouverture du dialogue |
| `onOpenChange` | `(open: boolean) => void` | - | Callback pour changer l'état |
| `title` | `string` | - | Titre du dialogue |
| `description` | `string` | - | Description du dialogue |
| `type` | `"warning" \| "error" \| "info" \| "success"` | `"warning"` | Type de dialogue (détermine l'icône et les couleurs) |
| `confirmText` | `string` | `"Confirmer"` | Texte du bouton de confirmation |
| `cancelText` | `string` | `"Annuler"` | Texte du bouton d'annulation |
| `onConfirm` | `() => void` | - | Callback appelé lors de la confirmation |
| `onCancel` | `() => void` | - | Callback appelé lors de l'annulation |
| `confirmVariant` | `ButtonVariant` | `"default"` | Variante du bouton de confirmation |
| `showCancel` | `boolean` | `true` | Afficher le bouton d'annulation |

### Types de dialogue

- **warning** : Icône triangle jaune, couleurs d'avertissement
- **error** : Icône cercle rouge, couleurs d'erreur  
- **info** : Icône info bleue, couleurs d'information
- **success** : Icône check vert, couleurs de succès

### Exemples d'utilisation

#### Dialogue d'erreur
```tsx
<ConfirmDialog
    open={showError}
    onOpenChange={setShowError}
    title="Erreur de validation"
    description="Certaines lignes de commande ne contiennent pas de produit sélectionné."
    type="error"
    confirmText="Compris"
    showCancel={false}
/>
```

#### Dialogue de succès
```tsx
<ConfirmDialog
    open={showSuccess}
    onOpenChange={setShowSuccess}
    title="Opération réussie"
    description="L'élément a été créé avec succès."
    type="success"
    confirmText="OK"
    showCancel={false}
/>
```

#### Dialogue de confirmation avec action personnalisée
```tsx
<ConfirmDialog
    open={showDelete}
    onOpenChange={setShowDelete}
    title="Supprimer l'élément"
    description="Cette action est irréversible. Continuer ?"
    type="warning"
    confirmText="Supprimer"
    confirmVariant="destructive"
    onConfirm={() => handleDelete(itemId)}
/>
```
