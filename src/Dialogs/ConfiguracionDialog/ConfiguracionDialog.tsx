import React from "react";
import {
  Dialog,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../components/Dialog";
import { DownloadIcon, GearIcon } from "@radix-ui/react-icons";

/**
 * Settings, reached from the bottom-right of the patients list.
 *
 * The backup export used to sit in the toolbar next to the everyday actions,
 * which gave a once-in-a-while maintenance task the same weight as opening a
 * patient. It belongs behind a settings surface instead.
 */
export function ConfiguracionDialog(
  props: React.PropsWithChildren<{ asChild?: boolean }>
) {
  const [busy, setBusy] = React.useState(false);

  const handleBackup = async () => {
    setBusy(true);
    try {
      await window.ipcRenderer.invoke("export-backup");
    } catch (error) {
      // Never swallow the reason: this is the clinic's only off-machine copy.
      console.error("[ui] export-backup failed:", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild={props.asChild}>{props.children}</DialogTrigger>
      <DialogContainer maxWidth={520}>
        <DialogTitle>
          <GearIcon /> Configuración
        </DialogTitle>
        <div className="flex flex-col gap-4 p-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Copia de seguridad
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Genera un archivo ZIP con la base de datos y todos los archivos
              adjuntos. Guardalo en un disco externo o en otra computadora: es
              la única copia que existe fuera de esta máquina.
            </p>
            <button
              type="button"
              onClick={handleBackup}
              disabled={busy}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-40"
            >
              <DownloadIcon />
              {busy ? "Generando…" : "Exportar copia de seguridad"}
            </button>
          </div>
        </div>
        <DialogFooter>
          <DialogCancelButton />
        </DialogFooter>
      </DialogContainer>
    </Dialog>
  );
}
