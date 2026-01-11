import type { Router } from "expo-router";
import { useEditFieldCallbackStore } from "@/stores/edit-field-callback-store";

export type OpenEditFieldArgs = {
  title: string;
  description?: string;
  label: string;
  fieldType: "text" | "email" | "number" | "select";
  placeholder?: string;
  initialValue: string;
  options?: { label: string; value: string }[]; // select
  onSave: (newValue: string) => void | Promise<void>;
};

export function openEditField(router: Router, args: OpenEditFieldArgs) {
  const editId = `edit-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // store the callback
  useEditFieldCallbackStore.getState().setCallback(editId, args.onSave);

  router.push({
    pathname: "/(modals)/edit-field",
    params: {
      editId,
      title: args.title,
      description: args.description ?? "",
      label: args.label,
      fieldType: args.fieldType,
      placeholder: args.placeholder ?? "",
      initialValue: args.initialValue ?? "",
      optionsJson:
        args.fieldType === "select" ? JSON.stringify(args.options ?? []) : "",
    },
  });
}
