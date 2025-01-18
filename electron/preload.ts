import { contextBridge, shell, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  // on(...args: Parameters<typeof electron.ipcRenderer.on>) {
  //   const [channel, listener] = args;
  //   return electron.ipcRenderer.on(channel, (event, ...args) =>
  //     listener(event, ...args)
  //   );
  // },
  // off(...args: Parameters<typeof electron.ipcRenderer.off>) {
  //   const [channel, ...omit] = args;
  //   return electron.ipcRenderer.off(channel, ...omit);
  // },
  // send(...args: Parameters<typeof electron.ipcRenderer.send>) {
  //   const [channel, ...omit] = args;
  //   return electron.ipcRenderer.send(channel, ...omit);
  // },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});
