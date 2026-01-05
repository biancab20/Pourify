import type { PaginatedResponse } from "./api";

export type Bar = {
  barId: number;
  name: string;
};

export type GetBarsResponse = PaginatedResponse<Bar>;

export type UpdateBarResponse = Bar;

export type DeleteBarResponse = void;