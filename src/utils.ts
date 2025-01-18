export function parseFileName(fileName: string) {
  const extensionDotIndex = fileName.lastIndexOf(".");

  if (extensionDotIndex <= 0 || extensionDotIndex === fileName.length - 1) {
    return {
      name: fileName,
      extension: "",
    };
  }

  const name = fileName.slice(0, extensionDotIndex).trim();
  const extension = fileName.slice(extensionDotIndex + 1).trim();

  if (!/^[a-zA-Z0-9-_]+$/.test(extension)) {
    return null;
  }

  if (!name) {
    return null;
  }

  return {
    name,
    extension: `.${extension}`, // Add the dot back to the extension
  };
}

export function parseFile(file: File | undefined | null) {
  if (!file || typeof file.name !== "string") {
    return null;
  }

  return {
    file,
    ...parseFileName(file.name),
  };
}
