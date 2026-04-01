"use client";

import { useState, useEffect } from "react";
import { ConfirmDialog, type ConfirmOptions } from "./ConfirmDialog";

export function ConfirmDialogWrapper() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const state = (e as CustomEvent<{ options: ConfirmOptions | null }>).detail;
      setOptions(state.options);
    };
    window.addEventListener("__dialog_update", handleUpdate);
    return () => window.removeEventListener("__dialog_update", handleUpdate);
  }, []);

  const handleClose = () => {
    setOptions(null);
    // Resolve the pending promise with false
    import("./ConfirmDialog").then(({ confirm }) => {
      // Promise already resolved in handleConfirm/cancel
    });
  };

  return <ConfirmDialog options={options} onClose={handleClose} />;
}
