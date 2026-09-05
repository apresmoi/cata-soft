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
import { CrumpledPaperIcon, FileIcon } from "@radix-ui/react-icons";
import { PatientCardField, PatientCardTextAreaField } from "../../components";

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

  const handleInputClick = () => {
    if (data.file) {
      handleFile(undefined);
      return;
    }
    fileInputRef.current?.click();
  };

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
      <DialogContainer>
        <DialogTitle>SUBIR ARCHIVO ADJUNTO</DialogTitle>

        <div className="flex gap-2 flex-col p-4 h-[60vh]">
          <div
            className={
              "relative cursor-pointer min-h-[100px]" +
              (invalid(data).includes("file") ? " ring-2 ring-red-500" : "")
            }
            onClick={handleInputClick}
          >
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
              }}
            />
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <rect
                width="100%"
                height="100%"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="16 8"
              />
            </svg>

            <div className="w-full h-full flex items-center justify-center dash-array hover:bg-stone-700 group">
              <label
                htmlFor="file"
                className="cursor-pointer text-center flex gap-2 items-center"
              >
                {data?.nombre ? (
                  <>
                    <FileIcon /> {data.nombre}
                  </>
                ) : (
                  <>ARRASTRA UN ARCHIVO A CUALQUIER LUGAR O HACE CLICK ACA</>
                )}
              </label>

              {data?.nombre && (
                <div className="absolute bottom-0 left-0 right-0 top-0 p-2 hidden group-hover:flex">
                  <button className="p-2 m-auto text-xl bg-red-800 text-stone-100 flex items-center gap-2">
                    <CrumpledPaperIcon />
                    BORRAR
                  </button>
                </div>
              )}
            </div>
          </div>
          <PatientCardField
            icon={<FileIcon />}
            label="NOMBRE"
            onChange={update("nombre")}
            value={data?.nombre || ""}
            invalid={invalid(data).includes("nombre")}
          />
          <PatientCardTextAreaField
            label="NOTAS"
            onChange={update("notas")}
            value={data?.notas || ""}
            className="flex-1"
          />
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
