"use client";

import { createContext, useContext } from "react";

interface ShellContextValue {
  setHideIdentityOnMobile: (hide: boolean) => void;
}

export const ShellContext = createContext<ShellContextValue>({
  setHideIdentityOnMobile: () => {},
});

export function useShell() {
  return useContext(ShellContext);
}
