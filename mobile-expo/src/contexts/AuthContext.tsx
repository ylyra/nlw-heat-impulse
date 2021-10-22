import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSessions from "expo-auth-session";

import { api } from "../services/api";

const CLIENT_ID = "";
const SCOPE = "read:user";
const USER_STORAGE = "@dowhile:user";
const TOKEN_STORAGE = "@dowhile:token";

type User = {
  id: string;
  avatar_url: string;
  name: string;
  login: string;
};

type AuthContextProps = {
  user: User | null;
  isSigningIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthResponse = {
  token: string;
  user: User;
};

type AuthorizationResponse = {
  params: {
    code?: string;
    error: string;
  };
  type?: string;
};

export const AuthContext = React.createContext({} as AuthContextProps);

export function AuthProvider(props: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = React.useState(true);

  const signIn = async () => {
    try {
      setIsSigningIn(true);
      const authUrl = `https://github.com/login/oauth/authroize?client_id=${CLIENT_ID}&scope=${SCOPE}`;
      const authSessionResponse = (await AuthSessions.startAsync({
        authUrl,
      })) as AuthorizationResponse;

      if (
        authSessionResponse.type === "success" &&
        authSessionResponse.params.error !== "access_denied"
      ) {
        const authResponse = await api.post<AuthResponse>("/authenticate", {
          code: authSessionResponse.params.code,
        });

        await AsyncStorage.setItem(TOKEN_STORAGE, authResponse.data.token);
        await AsyncStorage.setItem(
          USER_STORAGE,
          JSON.stringify(authResponse.data.user)
        );
        setUser(authResponse.data.user);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(TOKEN_STORAGE);
    await AsyncStorage.removeItem(USER_STORAGE);
    setUser(null);
  };

  const values = {
    user,
    isSigningIn,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={values}>{props.children}</AuthContext.Provider>
  );
}
