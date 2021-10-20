import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
  id: string;
  avatar_url: string;
  name: string;
  login: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

type AuthContextProps = {
  user: User | null;
  signInUrl: string;

  signOut: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=88cfecbd32168a54ef21`;

  async function signIn(code: string) {
    const response = await api.post<AuthResponse>("authenticate", { code });

    const { token, user } = response.data;

    localStorage.setItem("@dowhile:token", token);
    setUser(user);
    api.defaults.headers.common.authorization = `Bearer ${token}`;
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("@dowhile:token");
  }

  useEffect(() => {
    const token = localStorage.getItem("@dowhile:token");

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    if (token) {
      api.get<User>("profile").then((response) => {
        setUser(response.data);
      });
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");

      window.history.pushState({}, "", urlWithoutCode);
      signIn(githubCode);
    }
  }, []);

  const value = {
    user,
    signInUrl,

    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
