// app/(settings)/[entity]/edit-field.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import SingleFieldEditScreen, {
  SelectOption,
} from "@/components/dynamic/SingleFieldEditScreen";

import { useSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useBar, useUpdateBar } from "@/hooks/useLocations";

import {
  getSettingsField,
  loadSettingsFieldValue,
  saveSettingsFieldValue,
} from "@/utils/settings-fields";

type EntityKey = "products" | "suppliers" | "locations" | "settings";
type FieldKey = string;

const PRODUCT_TYPE_OPTIONS: SelectOption[] = [
  { label: "Keg", value: "KEG" },
  { label: "Wine", value: "WINE" },
  { label: "Box", value: "BOX" },
  { label: "Unit", value: "UNIT" },
  { label: "Bottle", value: "BOTTLE" },
];

function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "object" && err && "message" in err)
    return String((err as any).message);
  return "Unknown error";
}

export default function EditEntityFieldRoute() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    entity?: string;
    id?: string;
    fieldKey?: string;
  }>();

  const entity = (params.entity ?? "products") as EntityKey;
  const id = params.id ?? "";
  const fieldKey = (params.fieldKey ?? "name") as FieldKey;

  const isSettings = entity === "settings";

  // ✅ Hooks are ALWAYS called (no conditional hooks)
  const supplierQuery = useSupplier(entity === "suppliers" ? id : "");
  const productQuery = useProduct(entity === "products" ? id : "");
  const barQuery = useBar(entity === "locations" ? id : "");

  const updateSupplier = useUpdateSupplier();
  const updateProduct = useUpdateProduct();
  const updateBar = useUpdateBar();

  // ✅ Memo is ALWAYS called (no conditional useMemo)
  const settingsField = useMemo(
    () => getSettingsField(String(fieldKey)),
    [fieldKey]
  );

  // -----------------------------
  // SETTINGS (STATIC) STATE
  // -----------------------------
  const [settingsInitialValue, setSettingsInitialValue] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSettings) return;

    let active = true;
    setSettingsLoading(true);
    setSettingsError(null);

    (async () => {
      try {
        if (!settingsField) {
          if (active) setSettingsError("Unsupported settings field");
          return;
        }
        const v = await loadSettingsFieldValue(settingsField);
        if (active) setSettingsInitialValue(v);
      } catch (e) {
        if (active) setSettingsError(getErrorMessage(e));
      } finally {
        if (active) setSettingsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isSettings, settingsField]);

  // -----------------------------
  // ENTITY MODE DERIVATIONS (ALWAYS COMPUTED)
  // -----------------------------
  const activeQuery =
    entity === "suppliers"
      ? supplierQuery
      : entity === "products"
      ? productQuery
      : barQuery;

  const item: any = activeQuery.data ?? null;

  const isSaving =
    (entity === "suppliers" && updateSupplier.isPending) ||
    (entity === "products" && updateProduct.isPending) ||
    (entity === "locations" && updateBar.isPending);

  const label = useMemo(() => {
    if (entity === "locations" && fieldKey === "name") return "Location name";
    if (entity === "suppliers" && fieldKey === "name") return "Supplier name";
    if (entity === "suppliers" && fieldKey === "email") return "Email";
    if (entity === "products" && fieldKey === "name") return "Product name";
    if (entity === "products" && fieldKey === "volume") return "Volume (L)";
    if (entity === "products" && fieldKey === "type") return "Type";
    return "Edit field";
  }, [entity, fieldKey]);

  const title = useMemo(() => {
    const base =
      entity === "suppliers"
        ? "Supplier"
        : entity === "products"
        ? "Product"
        : entity === "locations"
        ? "Stock location"
        : "Venue setting";
    return `${base}: ${label}`;
  }, [entity, label]);

  const entityFieldType = useMemo<
    "text" | "email" | "number" | "select"
  >(() => {
    if (fieldKey === "email") return "email";
    if (fieldKey === "volume") return "number";
    if (fieldKey === "type") return "select";
    return "text";
  }, [fieldKey]);

  const entityOptions = useMemo(
    () => (entityFieldType === "select" ? PRODUCT_TYPE_OPTIONS : undefined),
    [entityFieldType]
  );

  const entityInitialValue = useMemo(() => {
    if (!item) return "";
    if (fieldKey === "name") return item.name ?? "";
    if (fieldKey === "email") return item.email ?? "";
    if (fieldKey === "volume")
      return item.volume == null ? "" : String(item.volume);
    if (fieldKey === "type") return item.type ?? "";
    return "";
  }, [fieldKey, item]);

  const entityValidate = (v: string) => {
    const trimmed = v.trim();

    if (fieldKey === "name") {
      if (!trimmed) return `Please enter a ${label.toLowerCase()}.`;
      return null;
    }
    if (fieldKey === "email") {
      if (!trimmed) return "Please enter an email.";
      if (!trimmed.includes("@")) return "Please enter a valid email.";
      return null;
    }
    if (fieldKey === "volume") {
      if (!trimmed) return "Please enter a volume.";
      const n = Number(trimmed);
      if (!Number.isFinite(n) || n <= 0) return "Please enter a valid volume.";
      return null;
    }
    if (fieldKey === "type") {
      if (!v) return "Please select a type.";
      return null;
    }
    return null;
  };

  const entityErrorMessage = activeQuery.error
    ? `Could not load ${entity.slice(0, -1)}: ${getErrorMessage(
        activeQuery.error
      )}`
    : !id
    ? "Missing id"
    : null;

  const onSaveEntity = async (newValue: string) => {
    if (!id) throw new Error("Missing id");

    if (entity === "locations") {
      if (fieldKey !== "name")
        throw new Error("Unsupported field for location");
      await updateBar.mutateAsync({
        barId: id,
        data: { name: newValue.trim() },
      });
    }

    if (entity === "suppliers") {
      if (!item) throw new Error("Supplier not loaded yet");

      const currentName = item.name ?? "";
      const currentEmail = item.email ?? "";

      const nextName = fieldKey === "name" ? newValue.trim() : currentName;
      const nextEmail = fieldKey === "email" ? newValue.trim() : currentEmail;

      if (!nextName.trim()) throw new Error("Supplier name cannot be empty");
      if (!nextEmail.trim()) throw new Error("Supplier email cannot be empty");

      await updateSupplier.mutateAsync({
        supplierId: id,
        data: {
          name: nextName,
          email: nextEmail,
        },
      });

      router.back();
      return;
    }

    if (entity === "products") {
      if (!item) throw new Error("Product not loaded yet");

      const currentName = item.name ?? "";
      const currentVolume = (item as any).volume;
      const currentType = (item as any).type ?? "";

      if (fieldKey === "name") {
        await updateProduct.mutateAsync({
          productId: id,
          data: {
            name: newValue.trim(),
            volume: currentVolume,
            type: currentType,
          },
        });
      } else if (fieldKey === "volume") {
        const n = Number(newValue);
        if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid volume");

        await updateProduct.mutateAsync({
          productId: id,
          data: {
            name: currentName,
            volume: n,
            type: currentType,
          },
        });
      } else if (fieldKey === "type") {
        await updateProduct.mutateAsync({
          productId: id,
          data: {
            name: currentName,
            volume: currentVolume,
            type: newValue,
          },
        });
      } else {
        throw new Error("Unsupported field for product");
      }
    }

    router.back();
  };

  // -----------------------------
  // SETTINGS RENDER (NO CONDITIONAL HOOKS ABOVE)
  // -----------------------------
  if (isSettings) {
    const validateSettings = (v: string) => {
      if (!settingsField) return "Unsupported settings field";

      const trimmed = v.trim();
      if (settingsField.allowEmpty && !trimmed) return null;

      if (settingsField.fieldType === "email") {
        if (!trimmed && !settingsField.allowEmpty)
          return "Please enter an email.";
        if (trimmed && !trimmed.includes("@"))
          return "Please enter a valid email.";
        return null;
      }

      if (settingsField.fieldType === "number") {
        if (!trimmed && !settingsField.allowEmpty)
          return "Please enter a value.";
        if (!trimmed) return null;
        const n = Number(trimmed);
        if (!Number.isFinite(n)) return "Please enter a valid number.";
        return null;
      }

      if (settingsField.fieldType === "select") {
        if (!trimmed && !settingsField.allowEmpty)
          return "Please select a value.";
        return null;
      }

      if (!trimmed && !settingsField.allowEmpty) return "Please enter a value.";
      return null;
    };

    const onSaveSettings = async (newValue: string) => {
      if (!settingsField) throw new Error("Unsupported settings field");
      await saveSettingsFieldValue(settingsField, newValue);
      router.back();
    };

    // Use entity mode UI to show loading/error states
    if (settingsLoading || settingsError) {
      return (
        <SingleFieldEditScreen
          mode="entity"
          title={settingsField?.title ?? "Venue setting"}
          label={settingsField?.label ?? "Setting"}
          fieldType={settingsField?.fieldType ?? "text"}
          options={settingsField?.options}
          placeholder={settingsField?.placeholder}
          initialValue={settingsInitialValue}
          validate={validateSettings}
          onSave={onSaveSettings}
          isLoading={settingsLoading}
          errorMessage={settingsError}
          onRetry={() => {
            (async () => {
              try {
                if (!settingsField) return;
                setSettingsLoading(true);
                setSettingsError(null);
                const v = await loadSettingsFieldValue(settingsField);
                setSettingsInitialValue(v);
              } catch (e) {
                setSettingsError(getErrorMessage(e));
              } finally {
                setSettingsLoading(false);
              }
            })();
          }}
          onClose={() => router.back()}
          saveLabel="Save"
          isSaving={false}
        />
      );
    }

    return (
      <SingleFieldEditScreen
        mode="static"
        title={settingsField?.title ?? "Venue setting"}
        label={settingsField?.label ?? "Setting"}
        fieldType={settingsField?.fieldType ?? "text"}
        options={settingsField?.options}
        placeholder={settingsField?.placeholder}
        initialValue={settingsInitialValue}
        validate={validateSettings}
        onSave={onSaveSettings}
        onClose={() => router.back()}
        saveLabel="Save"
      />
    );
  }

  // -----------------------------
  // ENTITY RENDER
  // -----------------------------
  return (
    <SingleFieldEditScreen
      mode="entity"
      title={title}
      label={label}
      fieldType={entityFieldType}
      options={entityOptions}
      initialValue={entityInitialValue}
      validate={entityValidate}
      onSave={onSaveEntity}
      isLoading={activeQuery.isLoading}
      isRefetching={activeQuery.isRefetching}
      errorMessage={entityErrorMessage}
      onRetry={() => activeQuery.refetch()}
      onClose={() => router.back()}
      saveLabel="Save"
      isSaving={isSaving}
    />
  );
}
