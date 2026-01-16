import { PyroCreator, PyroUser } from "@/lib/types/pyro.types";
import { useApiMutation } from "./use-api-mutation";

// Request OTP types
interface RequestOtpRequest {
  email: string;
}

interface RequestOtpResponse {
  success: boolean;
  message?: string;
  email?: string;
  error?: string;
}

// Verify OTP types
interface VerifyOtpRequest {
  email: string;
  otp: string;
  brandSlug: string;
}

interface VerifyOtpResponse {
  success: boolean;
  hasCreator?: boolean;
  user?: PyroUser;
  creator?: PyroCreator | null;
  error?: string;
}

// Disconnect types
interface DisconnectRequest {
  brandSlug: string;
}

interface DisconnectResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Hook for requesting OTP
export const usePyroRequestOtp = () => {
  return useApiMutation<RequestOtpResponse, RequestOtpRequest>({
    url: "/api/pyro/auth/request-otp",
    method: "POST",
    body: (variables) => variables,
    tokenType: null,
    isProtected: true,
  });
};

// Hook for verifying OTP
export const usePyroVerifyOtp = () => {
  return useApiMutation<VerifyOtpResponse, VerifyOtpRequest>({
    url: "/api/pyro/auth/verify-otp",
    method: "POST",
    body: (variables) => variables,
    tokenType: null,
    isProtected: true,
  });
};

// Hook for disconnecting Pyro account
export const usePyroDisconnect = () => {
  return useApiMutation<DisconnectResponse, DisconnectRequest>({
    url: "/api/pyro/auth/disconnect",
    method: "POST",
    body: (variables) => variables,
    tokenType: null,
    isProtected: true,
  });
};
