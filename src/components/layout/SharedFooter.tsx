
import { Link } from "react-router-dom";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { useEffect } from "react";

export const SharedFooter = () => {
  const handleLinkClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gray-50 py-12 border-t border-gray-100 w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" onClick={handleLinkClick} className="text-xl font-bold text-gray-900 hover:text-primary transition-colors">
              Debtfreeo
            </Link>
            <p className="text-gray-600">
              Your journey to financial freedom starts here.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/tools" onClick={handleLinkClick} className="hover:text-primary transition-colors">
                  Free Tools
                </Link>
              </li>
              <li>
                <Link to="/blog" onClick={handleLinkClick} className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" onClick={handleLinkClick} className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/pricing" onClick={handleLinkClick} className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/about" onClick={handleLinkClick} className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <LegalFooter />
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>&copy; 2025 Debtfreeo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
