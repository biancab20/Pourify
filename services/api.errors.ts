export type ApiError = {
  message: string;
  status?: number;
  body?: string;
};

export function toApiError(e: unknown): ApiError {
  if (typeof e === "object" && e !== null) {
    // If we threw an ApiError already
    if ("message" in e && typeof (e as any).message === "string") {
      return e as ApiError;
    }
  }
  return { message: String(e) };
}
