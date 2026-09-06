import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

type UseCommonNewRegistryListOptions<T> = {
  endpointKey: string;

  invalidateQueries?: string[][];

  initialValues?: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>;
};

export function useCommonNewRegistry<T>(
  options: UseCommonNewRegistryListOptions<T>,
  ...args: string[]
) {
  const queryClient = useQueryClient();

  const [data, setData] = React.useState<
    Partial<Omit<T, "id" | "createdAt" | "updatedAt">>
  >(options.initialValues || {});

  const save = async () => {
    try {
      console.log("create-" + options.endpointKey);
      console.log(data, ...args);
      const result = (await window.ipcRenderer.invoke(
        "create-" + options.endpointKey,
        data,
        ...args
      )) as T;

      console.log(" result", result);

      await queryClient.invalidateQueries({
        queryKey: [options.endpointKey, ...args],
      });

      if (options.invalidateQueries)
        await Promise.all(
          options.invalidateQueries.map((queryKey) => {
            queryClient.invalidateQueries({
              queryKey,
            });
          })
        );

      if (result) setData({});
      return result;
    } catch (e) {
      return null;
    }
  };

  const update = <K extends keyof Omit<T, "id" | "createAt" | "updateAt">>(
    key: K
  ) => {
    return (value: T[K]) => {
      setData((oldData) => {
        return {
          ...oldData,
          [key]: value,
        };
      });
    };
  };

  const clear = () => {
    setData(options.initialValues || {});
  };

  return {
    data,
    update,
    save,
    clear,
  };
}

type UseCommonRegistryListOptions = {
  endpointKey: string;
  enabled?: boolean;
};

export function useCommonRegistryList<T>(
  options: UseCommonRegistryListOptions,
  ...args: string[]
) {
  const { data, isFetching, refetch } = useQuery<T[]>({
    queryKey: [options.endpointKey, ...args],
    queryFn: async () => {
      try {
        return window.ipcRenderer.invoke("get-" + options.endpointKey, ...args);
      } catch (e) {
        return [];
      }
    },
  });

  const create = async (
    paciente: Omit<T, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const obj = await window.ipcRenderer.invoke(
        "create-" + options.endpointKey,
        paciente,
        ...args
      );
      refetch();
      return obj;
    } catch (e) {
      return null;
    }
  };

  return {
    data,
    isFetching,
    create,
  };
}

type UseCommonRegistryOptions = {
  endpointKey: string;
  enabled?: boolean;

  invalidateQueries?: string[][];
};

export function useCommonRegistry<T>(
  options: UseCommonRegistryOptions,
  ...args: string[]
) {
  const queryClient = useQueryClient();

  const [isModified, setHasChanged] = React.useState(false);

  /**
   * Edits land in React state, not only in the query cache.
   *
   * Writing solely to the cache made the new value arrive a tick after the
   * keystroke, so React committed the previous value first, restored it onto
   * the input, and bounced the caret to the end of the text before the real
   * value landed. Keeping a draft here means the input re-renders in the same
   * commit as the keystroke: one paint, caret untouched.
   */
  const [draft, setDraft] = React.useState<Partial<T>>({});

  const {
    data: fetched,
    isFetching,
    refetch,
  } = useQuery<T | null>({
    queryKey: [options.endpointKey, ...args],
    queryFn: async () => {
      try {
        setHasChanged(false);
        // Server data is authoritative again; drop any local edits.
        setDraft({});
        return window.ipcRenderer.invoke("get-" + options.endpointKey, ...args);
      } catch (e) {
        return null;
      }
    },
    enabled: options.enabled,
  });

  const data = React.useMemo(
    () => (fetched ? { ...fetched, ...draft } : fetched),
    [fetched, draft]
  );

  const save = async () => {
    try {
      const saved = await window.ipcRenderer.invoke(
        "update-" + options.endpointKey,
        data,
        ...args
      );

      await refetch();

      if (options.invalidateQueries)
        await Promise.all(
          options.invalidateQueries.map((queryKey) => {
            queryClient.invalidateQueries({
              queryKey,
            });
          })
        );

      return saved;
    } catch (e) {
      return null;
    }
  };

  const update = <K extends keyof Omit<T, "id" | "createAt" | "updateAt">>(
    key: K,
    updateOptions?: {
      uppercase?: boolean;
    }
  ) => {
    return (value: T[K]) => {
      const next = updateOptions?.uppercase
        ? ((value as string).toUpperCase() as T[K])
        : value;

      setHasChanged(true);
      setDraft((oldDraft) => ({ ...oldDraft, [key]: next }));

      // Keep the cache in step so a remount does not lose the edit.
      queryClient.setQueryData<T>([options.endpointKey, ...args], (oldData) =>
        oldData ? { ...oldData, [key]: next } : oldData
      );
    };
  };

  const remove = async () => {
    try {
      await window.ipcRenderer.invoke("delete-" + options.endpointKey, ...args);
      if (options.invalidateQueries)
        await Promise.all(
          options.invalidateQueries.map((queryKey) => {
            queryClient.invalidateQueries({
              queryKey,
            });
          })
        );
    } catch (e) {}
  };

  return {
    data,
    isFetching,
    update,
    save,
    isModified,
    remove,
  };
}

export function useCommonDeleteRegistry(
  options: UseCommonRegistryOptions,
  ...args: string[]
) {
  const queryClient = useQueryClient();

  const remove = async () => {
    try {
      await window.ipcRenderer.invoke("delete-" + options.endpointKey, ...args);
      if (options.invalidateQueries)
        await Promise.all(
          options.invalidateQueries.map((queryKey) => {
            queryClient.invalidateQueries({
              queryKey,
            });
          })
        );
    } catch (e) {}
  };

  return {
    remove,
  };
}
