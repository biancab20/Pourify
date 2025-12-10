import { SvgXml } from "react-native-svg";
import { ICONS, IconName } from "./icon-registry";
import React from "react";

type IconProps = {
  name: IconName;
  size?: number;         // height & width
  color?: string;        // overrides any fills in the XML
};

function applyColor(xml: string, color?: string) {
  if (!color) return xml;
  return xml.replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`);
}

export const Icon: React.FC<IconProps> = React.memo(
  ({ name, size = 24, color }) => {
    const raw = ICONS[name];
    if (__DEV__ && !raw) {
      console.warn(`[Icon] Unknown icon name: "${name}"`);
    }
    const xml = React.useMemo(() => applyColor(raw, color), [raw, color]);

    return (
      <SvgXml
        xml={xml}
        width={size}
        height={size}
      />
    );
  }
);
Icon.displayName = "Icon";
