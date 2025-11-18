import { Dialog, Button, Flex } from "@radix-ui/themes";
import { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "red" | "blue" | "green";
  trigger?: ReactNode;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  confirmColor = "red",
  trigger,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger>{trigger}</Dialog.Trigger>}
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {description}
        </Dialog.Description>
        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              {cancelLabel}
            </Button>
          </Dialog.Close>
          <Button color={confirmColor} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
