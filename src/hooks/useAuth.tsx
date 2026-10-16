import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return { error: null };
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials")) return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    if (msg.includes("email not confirmed")) return { error: "이메일 인증이 필요합니다." };
    if (msg.includes("rate limit") || msg.includes("too many")) return { error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." };
    return { error: "로그인에 실패했습니다. 다시 시도해주세요." };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already been registered")) return { error: "이미 가입된 이메일입니다." };
      if (msg.includes("weak password") || msg.includes("password should be")) return { error: "비밀번호가 너무 간단합니다. 6자 이상으로 입력해주세요." };
      return { error: "회원가입에 실패했습니다. 다시 시도해주세요." };
    }
    if (data.user && !data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) return { error: "가입은 완료되었으나 자동 로그인에 실패했습니다. 다시 로그인해주세요." };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
