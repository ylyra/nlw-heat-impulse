import React, { useEffect } from "react";
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
  const [isSigningIn, setIsSigningIn] = React.useState(false);

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

        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${authResponse.data.token}`;
        await AsyncStorage.multiSet([
          [TOKEN_STORAGE, authResponse.data.token],
          [USER_STORAGE, JSON.stringify(authResponse.data.user)],
        ]);

        setUser(authResponse.data.user);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove([TOKEN_STORAGE, USER_STORAGE]);
    setUser(null);
  };

  useEffect(() => {
    async function loadStorageData() {
      const [token, user] = await AsyncStorage.multiGet([
        TOKEN_STORAGE,
        USER_STORAGE,
      ]);

      if (token[1] && user[1]) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(JSON.parse(user[1]));
      }
    }
    loadStorageData();
  }, []);

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
