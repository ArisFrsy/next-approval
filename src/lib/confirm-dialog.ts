// lib/confirm-dialog.ts
import { ConfirmDialogOptions } from "./confirm-dialog-context";
import { getDialogInstance } from "./confirm-dialog-context";

export const confirmDialog = (options: ConfirmDialogOptions) => {
  const dialog = getDialogInstance();
  return dialog.show(options);
};
