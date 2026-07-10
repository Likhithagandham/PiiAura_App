export const AUTH_ROUTES = {
  login: "/login",
  forgotPassword: "/forgot-password",
  forgotPasswordSelectAccount: "/forgot-password/select-account",
  forgotPasswordVerifyOtp: "/forgot-password/verify-otp",
  forgotPasswordNewPassword: "/forgot-password/new-password",
  inviteAccept: "/invite",
  changePassword: "/reset-password",
} as const;

export const PUBLIC_AUTH_PATHS = [
  AUTH_ROUTES.login,
  AUTH_ROUTES.forgotPassword,
  AUTH_ROUTES.forgotPasswordSelectAccount,
  AUTH_ROUTES.forgotPasswordVerifyOtp,
  AUTH_ROUTES.forgotPasswordNewPassword,
] as const;

/** Path prefixes that are public (matched with startsWith). Used for invite links. */
export const PUBLIC_AUTH_PREFIXES = ["/invite/"] as const;
