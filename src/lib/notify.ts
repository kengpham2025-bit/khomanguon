import { toast as sonnerToast } from "sonner";

export const toast = sonnerToast;

export function notifySuccess(message: string, description?: string) {
  sonnerToast.success(message, description ? { description } : undefined);
}

export function notifyError(message: string, description?: string) {
  sonnerToast.error(message, description ? { description } : undefined);
}

export function notifyInfo(message: string, description?: string) {
  sonnerToast.info(message, description ? { description } : undefined);
}
