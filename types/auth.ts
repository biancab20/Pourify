export type AuthUser = {
  userId: string;
  email: string;
  roles: string[]; // can be narrowed later: ("admin" | "bartender" | ...)
};

export type AuthCallbackResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer" | string;
  user: AuthUser;
};
