import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Catalogo from "./pages/Catalogo";
import Vendas from "./pages/Vendas";
import Fornecedoras from "./pages/Fornecedoras";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import { initializeData } from "@/lib/initialData";

initializeData();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/fornecedoras" element={<Fornecedoras />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
