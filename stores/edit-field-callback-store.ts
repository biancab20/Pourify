import { create } from "zustand";

export type OnSaveResult =
  | void
  | boolean
  | { close?: boolean; nextValue?: string };

export type OnSaveFn = (value: string) => Promise<OnSaveResult> | OnSaveResult;

type Store = {
  callbacks: Record<string, OnSaveFn | undefined>;
  setCallback: (id: string, cb: OnSaveFn) => void;
  getCallback: (id: string) => OnSaveFn | undefined;
  clearCallback: (id: string) => void;
};

export const useEditFieldCallbackStore = create<Store>((set, get) => ({
  callbacks: {},
  setCallback: (id, cb) =>
    set((s) => ({ callbacks: { ...s.callbacks, [id]: cb } })),
  getCallback: (id) => get().callbacks[id],
  clearCallback: (id) =>
    set((s) => {
      const next = { ...s.callbacks };
      delete next[id];
      return { callbacks: next };
    }),
}));
