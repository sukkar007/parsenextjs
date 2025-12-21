import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// استيراد مكونات الإدارة
import CategoriesManagement from "./components/CategoriesManagement";
import AddCategory from "./components/AddCategory";
import EditCategory from "./components/EditCategory";
import ViewCategory from "./components/ViewCategory";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/dashboard"} component={Dashboard} />
      
      {/* مسارات إدارة الفئات */}
      <Route path={"/admin/categories"} component={CategoriesManagement} />
      <Route path={"/admin/categories/add"} component={AddCategory} />
      <Route path={"/admin/categories/edit"} component={EditCategory} />
      <Route path={"/admin/categories/view"} component={ViewCategory} />
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;