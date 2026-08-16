import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    type?: 'success' | 'error' | 'info';
    actionLabel?: string;
    onAction?: () => void;
}

export function InfoModal({
    isOpen,
    onClose,
    title,
    description,
    type = 'info',
    actionLabel = 'Close',
    onAction,
}: InfoModalProps) {
    const handleAction = () => {
        if (onAction) {
            onAction();
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        {type === 'success' && <CheckCircle2 className="w-6 h-6 text-success" />}
                        {type === 'error' && <AlertCircle className="w-6 h-6 text-destructive" />}
                        {type === 'info' && <Info className="w-6 h-6 text-accent" />}
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-end">
                    <Button onClick={handleAction}>
                        {actionLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
