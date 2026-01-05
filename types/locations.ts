// types/locations.ts
import type { PaginatedResponse } from "./api";

export type Bar = {
  barId: string;  // Changed from number to string to match GUID
  name: string;
};

export type GetBarsResponse = PaginatedResponse<Bar>;

export type UpdateBarResponse = Bar;

export type DeleteBarResponse = void;