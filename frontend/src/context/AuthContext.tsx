import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  signIn as signInRequest,
  signUp as signUpRequest,
  type AuthUser,
} from "../services/authService";

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

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signUp: (data: SignUpData) => Promise<void>;
signIn: (data: SignInData) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem("chopgo_user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("chopgo_user");
      return null;
    }
  });

 const signUp = async (data: SignUpData) => {
  await signUpRequest(data);

  // Signup does not authenticate the user.
  // The user must verify their email and then sign in.
  localStorage.removeItem("chopgo_token");
  localStorage.removeItem("chopgo_user");
  localStorage.removeItem("chopgo_phone");

  setUser(null);
};

const signIn = async (data: SignInData): Promise<AuthUser> => {
  const response = await signInRequest(data);

  localStorage.setItem("chopgo_token", response.token);
  localStorage.setItem(
    "chopgo_user",
    JSON.stringify(response.user)
  );
  localStorage.setItem("chopgo_phone", response.user.phone);

  setUser(response.user);

  return response.user;
};

  const logout = () => {
    localStorage.removeItem("chopgo_token");
    localStorage.removeItem("chopgo_user");
    localStorage.removeItem("chopgo_phone");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        signUp,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
export default AuthContext;