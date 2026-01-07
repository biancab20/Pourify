import type { ODataList } from "@/types/odata";

export type Bar = {
  barId: string; 
  name: string;
};

export type BarDto = {
  BarId: string;
  BarName: string;
};

export type GetBarsResponse = ODataList<Bar>;
export type GetBarByIdResponse = Bar;
export type CreateBarResponse = Bar;
export type UpdateBarResponse = Bar;
export type DeleteBarResponse = { value: boolean };