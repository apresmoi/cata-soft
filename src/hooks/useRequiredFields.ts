import React from "react";

/**
 * A field that must be filled in before a record can be saved.
 *
 * `positiveNumber` is for the anthropometry measurements, which arrive from the
 * inputs as strings and default to 0 -- a weight of 0 is not a value.
 */
export type RequiredField<T> = {
  name: keyof T & string;
  kind?: "text" | "positiveNumber";
};

function isMissing<T>(field: RequiredField<T>, value: unknown) {
  if (value === null || value === undefined) return true;

  if (field.kind === "positiveNumber") {
    const numeric = Number(value);
    return !Number.isFinite(numeric) || numeric <= 0;
  }

  if (value instanceof Uint8Array) return value.byteLength === 0;

  return String(value).trim() === "";
}

/**
 * Gate saving on the required fields being filled.
 *
 * Nothing is flagged until a save is actually attempted -- a form should not
 * shout at you while you are still filling it in. After that, flags clear as
 * each field is completed.
 *
 * The schema's NOT NULL columns are the source of truth for what is required;
 * see prisma/schema.prisma.
 */
export function useRequiredFields<T extends object>(
  required: RequiredField<T>[]
) {
  const [attempted, setAttempted] = React.useState(false);

  const missing = React.useCallback(
    (data: Partial<T> | undefined) =>
      required
        .filter((field) => isMissing(field, data?.[field.name]))
        .map((field) => field.name),
    [required]
  );

  /** True when the data is complete. Flags the gaps when it is not. */
  const check = (data: Partial<T> | undefined) => {
    setAttempted(true);
    return missing(data).length === 0;
  };

  /** Which fields to draw a red ring around right now. */
  const invalid = (data: Partial<T> | undefined) => {
    if (!attempted) return [] as (keyof T & string)[];
    return missing(data);
  };

  const reset = () => setAttempted(false);

  return { check, invalid, reset };
}
