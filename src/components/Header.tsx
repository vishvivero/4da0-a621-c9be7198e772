
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "./header/Navigation";
import { AuthButtons } from "./header/AuthButtons";
import { Loader2, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ThemeToggle } from "./theme/ThemeToggle";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";

const Header = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isPlannerPage = location.pathname === '/overview';
  const isSignupPage = location.pathname === '/signup';

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for profile fetch");
        return null;
      }
      
      console.log("Fetching profile for user:", user.id);
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }

      console.log("Profile data fetched:", existingProfile);
      return existingProfile;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });

  const handleAuthSuccess = async () => {
    console.log("Auth success handler triggered");
    
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    await queryClient.invalidateQueries({ queryKey: ["debts"] });
    
    toast({
      title: "Welcome! 👋",
      description: "Successfully signed in. Let's start planning your debt-free journey!",
    });
    
    navigate("/overview");
  };

  const handleSignupClick = () => {
    // First navigate to the new route
    navigate("/signup");
    
    // Use a slightly longer timeout and ensure we're at the root document
    setTimeout(() => {
      // Get the document root element
      const docElement = document.documentElement;
      const bodyElement = document.body;
      
      // Reset both documentElement and body scroll
      docElement.scrollTop = 0;
      bodyElement.scrollTop = 0;
      
      // Fallback to window.scrollTo for broader compatibility
      window.scrollTo({
        top: 0,
        behavior: 'instant' // Use instant instead of smooth for more reliable behavior
      });
    }, 150); // Increased timeout for better reliability
  };

  return (
    <header className="fixed top-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b w-full">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                {user ? <SidebarNavigation /> : <Navigation />}
              </SheetContent>
            </Sheet>
            <Link to="/" className="font-bold text-xl text-primary">
              Debtfreeo
            </Link>
            <div className="hidden lg:block">
              {user ? <SidebarNavigation /> : <Navigation />}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isSignupPage && !user && (
              <Button 
                variant="default" 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-sm"
                onClick={handleSignupClick}
              >
                Sign Up
              </Button>
            )}
            {user && profileLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <AuthButtons 
                user={user} 
                profile={profile} 
                onAuthSuccess={handleAuthSuccess} 
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
