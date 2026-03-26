import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  titulo = '¿Estás seguro?',
  descripcion = 'Esta acción no se puede deshacer.',
  labelConfirmar = 'Confirmar',
  labelCancelar = 'Cancelar',
  variante = 'destructive',
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {labelCancelar}
          </Button>
          <Button variant={variante} onClick={onConfirm}>
            {labelConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;