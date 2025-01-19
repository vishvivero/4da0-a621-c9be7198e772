import { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SupabaseContext = createContext(supabase);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => useContext(SupabaseContext);