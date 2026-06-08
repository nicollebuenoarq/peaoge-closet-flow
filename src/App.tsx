import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Catalogo from "./pages/Catalogo";
import Vendas from "./pages/Vendas";
import Fornecedoras from "./pages/Fornecedoras";
import Configuracoes from "./pages/Configuracoes";
import Planejamento from "./pages/Planejamento";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { supabase } from "@/integrations/supabase/client";
import { seedSupabase } from "@/lib/seedSupabase";
import type { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Roda o seed automaticamente após o login, apenas uma vez por sessão
  useEffect(() => {
    if (session && !seeded) {
      setSeeded(true);
      seedSupabase().catch(err =>
        console.error('[App] Falha no seed automatico:', err)
      );
    }
  }, [session, seeded]);

  if (session === undefined) return null; // carregando sessao
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <AuthGuard>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/vendas" element={<Vendas />} />
                    <Route path="/fornecedoras" element={<Fornecedoras />} />
                    <Route path="/planejamento" element={<Planejamento />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
