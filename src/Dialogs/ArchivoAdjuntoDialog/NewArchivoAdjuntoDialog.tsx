import React from "react";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../components/Dialog";
import { useNewArchivoAdjunto } from "../../hooks";
import { useRequiredFields } from "../../hooks/useRequiredFields";
import { CrumpledPaperIcon, FileIcon, UploadIcon } from "@radix-ui/react-icons";
import { PatientCardField, RichTextField } from "../../components";
import cx from "classnames";

/** Format a byte count as a human-readable KB/MB string. */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface NewArchivoAdjuntoDialogProps {
  patientId: string;
}

export function NewArchivoAdjuntoDialog(
  props: React.PropsWithChildren<NewArchivoAdjuntoDialogProps>
) {
  const { data, save, update, clear } = useNewArchivoAdjunto(props.patientId);

  const [open, setOpen] = React.useState(false);

  const { check, invalid, reset } = useRequiredFields<typeof data>([
    { name: "nombre" },
    { name: "file" },
  ]);

  const handleSave = async () => {
    if (!check(data)) return;
    try {
      await save();
      setOpen(false);
    } catch (e) {}
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      clear();
      reset();
    }
    setOpen(open);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const handleFile = async (fileInput: File | undefined) => {
    if (fileInput) {
      update("file")(new Uint8Array(await fileInput.arrayBuffer()));
      update("nombre")(fileInput.name);
      update("fileName")(fileInput.name);
      update("fileType")(fileInput.type);
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.files = null;
    }
    update("file")(undefined);
    update("nombre")("");
    update("fileName")("");
    update("fileType")("");
  };

  React.useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      handleFile(e.dataTransfer?.files?.[0]);
    };

    document.body.addEventListener("dragover", handleDragOver);
    document.body.addEventListener("drop", handleDrop);

    return () => {
      document.body.removeEventListener("dragover", handleDragOver);
      document.body.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContainer maxWidth={560}>
        <DialogTitle>SUBIR ARCHIVO ADJUNTO</DialogTitle>

        <div className="flex min-w-0 flex-col gap-3">
          <input
            ref={fileInputRef}
            id="archivo-adjunto-file"
            className="sr-only"
            type="file"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
            }}
          />
          <label
            htmlFor="archivo-adjunto-file"
            className={cx(
              "flex min-h-20 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-stone-400 bg-stone-50 px-3 py-3 text-center transition-colors hover:border-brand-400 hover:bg-brand-50",
              invalid(data).includes("file") && "ring-2 ring-red-500"
            )}
          >
            <UploadIcon className="h-6 w-6 text-stone-400" />
            <span className="text-sm text-stone-600">
              Arrastrá un archivo a cualquier lugar de la ventana o hacé click acá para elegirlo
            </span>
          </label>

          {data?.file && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-3">
              <div className="flex min-w-0 items-center gap-2 text-sm text-stone-700">
                <FileIcon className="shrink-0 text-stone-400" />
                <span className="truncate">{data.nombre}</span>
                <span className="shrink-0 text-stone-400">
                  ({formatFileSize(data.file.byteLength)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleFile(undefined)}
                className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <CrumpledPaperIcon />
                BORRAR
              </button>
            </div>
          )}
          <PatientCardField
            icon={<FileIcon />}
            label="NOMBRE"
            onChange={update("nombre")}
            value={data?.nombre || ""}
            invalid={invalid(data).includes("nombre")}
          />
          <div className="h-32">
            <RichTextField
              label="NOTAS"
              onChange={update("notas")}
              value={data?.notas || ""}
              className="h-full"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogButton variant="primary" onClick={handleSave}>
            GUARDAR
          </DialogButton>
          <DialogCancelButton />
        </DialogFooter>
      </DialogContainer>
    </Dialog>
  );
}
