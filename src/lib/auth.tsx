import { Session } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { demoUserId } from "@/lib/demo";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  userId: string | null;
  isDemo: boolean;
  isLoading: boolean;
  startDemo: () => void;
  stopDemo: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  userId: null,
  isDemo: false,
  isLoading: true,
  startDemo: () => undefined,
  stopDemo: () => undefined
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setIsDemo(false);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      session,
      userId: isDemo ? demoUserId : session?.user.id ?? null,
      isDemo,
      isLoading,
      startDemo: () => {
        setSession(null);
        setIsDemo(true);
        setIsLoading(false);
      },
      stopDemo: () => setIsDemo(false)
    }),
    [isDemo, isLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
