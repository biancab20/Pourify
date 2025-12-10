import React, { memo, useMemo } from "react";
import { SvgXml } from "react-native-svg";
import { ICONS, IconName } from "./icon-registry";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Replace all non-"none" fill values with the provided color.
 * Keeps "fill=\"none\"" intact.
 */
function applyColor(xml: string, color?: string): string {
  if (!color) return xml;
  return xml.replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`);
}

function IconComponent({ name, size = 24, color }: IconProps) {
  const raw = ICONS[name];

  const xml = useMemo(() => (raw ? applyColor(raw, color) : ""), [raw, color]);

  if (__DEV__ && !raw) {
    console.warn(`[Icon] Unknown icon name: "${name}"`);
    return null;
  }

  return <SvgXml xml={xml} width={size} height={size} />;
}

export const Icon = memo(IconComponent);
Icon.displayName = "Icon";
