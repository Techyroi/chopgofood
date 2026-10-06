import api from "./api";

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  profileImage: string;
  role: "customer" | "restaurant" | "rider" | "admin";
}

interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

interface SignUpData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

interface SignInData {
  email: string;
  password: string;
}

export const signUp = async (
  data: SignUpData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/signup",
    data
  );

  return response.data;
};

export const signIn = async (
  data: SignInData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/signin",
    data
  );

  return response.data;
};

export default {
  signUp,
  signIn,
};