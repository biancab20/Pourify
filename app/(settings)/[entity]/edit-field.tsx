import React, { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import SingleFieldEditScreen, {
  SelectOption,
} from "@/components/ui/SingleFieldEditScreen";

import { useSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useBar, useUpdateBar } from "@/hooks/useLocations";

type EntityKey = "products" | "suppliers" | "locations";
type FieldKey = "name" | "email" | "volume" | "type";

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

  // fetch by id (source of truth)
  const supplierQuery = useSupplier(entity === "suppliers" ? id : "");
  const productQuery = useProduct(entity === "products" ? id : "");
  const barQuery = useBar(entity === "locations" ? id : "");

  const activeQuery =
    entity === "suppliers"
      ? supplierQuery
      : entity === "products"
      ? productQuery
      : barQuery;

  const item: any = activeQuery.data ?? null;

  // update hooks
  const updateSupplier = useUpdateSupplier();
  const updateProduct = useUpdateProduct();
  const updateBar = useUpdateBar();

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
        : "Stock location";
    return `${base}: ${label}`;
  }, [entity, label]);

  const fieldType = useMemo<"text" | "email" | "number" | "select">(() => {
    if (fieldKey === "email") return "email";
    if (fieldKey === "volume") return "number";
    if (fieldKey === "type") return "select";
    return "text";
  }, [fieldKey]);

  const options = useMemo(
    () => (fieldType === "select" ? PRODUCT_TYPE_OPTIONS : undefined),
    [fieldType]
  );

  const initialValue = useMemo(() => {
    if (!item) return "";
    if (fieldKey === "name") return item.name ?? "";
    if (fieldKey === "email") return item.email ?? "";
    if (fieldKey === "volume") return item.volume == null ? "" : String(item.volume);
    if (fieldKey === "type") return item.type ?? "";
    return "";
  }, [fieldKey, item]);

  const validate = (v: string) => {
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

  const errorMessage = activeQuery.error
    ? `Could not load ${entity.slice(0, -1)}: ${getErrorMessage(activeQuery.error)}`
    : !id
    ? "Missing id"
    : null;

  const onSave = async (newValue: string) => {
    if (!id) throw new Error("Missing id");

    // Build a Partial<Domain> data payload
    if (entity === "locations") {
      if (fieldKey !== "name") throw new Error("Unsupported field for location");
      await updateBar.mutateAsync({ barId: id, data: { name: newValue.trim() } });
    }

    if (entity === "suppliers") {
      if (fieldKey === "name") {
        await updateSupplier.mutateAsync({
          supplierId: id,
          data: { name: newValue.trim() },
        });
      } else if (fieldKey === "email") {
        await updateSupplier.mutateAsync({
          supplierId: id,
          data: { email: newValue.trim() },
        });
      } else {
        throw new Error("Unsupported field for supplier");
      }
    }

    if (entity === "products") {
      if (fieldKey === "name") {
        await updateProduct.mutateAsync({
          productId: id,
          data: { name: newValue.trim() },
        });
      } else if (fieldKey === "volume") {
        const n = Number(newValue);
        if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid volume");
        await updateProduct.mutateAsync({
          productId: id,
          data: { volume: n },
        });
      } else if (fieldKey === "type") {
        await updateProduct.mutateAsync({
          productId: id,
          data: { type: newValue },
        });
      } else {
        throw new Error("Unsupported field for product");
      }
    }

    router.back();
  };

  return (
    <SingleFieldEditScreen
      mode="entity"
      title={title}
      label={label}
      fieldType={fieldType}
      options={options}
      initialValue={initialValue}
      validate={validate}
      onSave={onSave}
      isLoading={activeQuery.isLoading}
      isRefetching={activeQuery.isRefetching}
      errorMessage={errorMessage}
      onRetry={() => activeQuery.refetch()}
      onClose={() => router.back()}
      saveLabel="Save"
      isSaving={isSaving}
    />
  );
}
