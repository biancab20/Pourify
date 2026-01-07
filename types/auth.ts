export type AuthTokenResponse = {
  access_token: string;
  expires_in: number; 
  refresh_expires_in?: number; 
  refresh_token: string;
  token_type: "Bearer" | string;

  not_before_policy?: number;
  session_state?: string;
  scope?: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number; 
};
