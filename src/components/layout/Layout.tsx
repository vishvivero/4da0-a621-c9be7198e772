import Header from "@/components/Header";
import { useTrackVisit } from "@/hooks/use-track-visit";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useTrackVisit();
  const location = useLocation();
  const isBlogPost = location.pathname.match(/^\/blog\/[^/]+$/);
  
  const backButtonText = isBlogPost ? "Back to Blog List" : "Back to Home";
  const backButtonLink = isBlogPost ? "/blog" : "/";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Header />
      <main className="flex-1 min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="content-container flex-1 flex flex-col">
          <Link to={backButtonLink}>
            <Button variant="outline" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backButtonText}
            </Button>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}