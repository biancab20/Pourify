import type { Photo } from "@/types/deliveries";
import type { PickedFile } from "@/app/(scan-flow)/scan-new-delivery";
import { makeId } from "@/utils/ids";

export function toPhotosFromAssets(assets: { uri: string }[]): Photo[] {
  return assets.map((a) => ({ id: makeId(), uri: a.uri }));
}

export function toPickedFile(asset: {
  uri: string;
  name?: string;
  mimeType?: string;
}): PickedFile {
  return {
    id: makeId(),
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType,
  };
}
