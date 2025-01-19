import { Calculator, LineChart, PiggyBank, Percent, CreditCard, Wallet, DollarSign, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const FreeTools = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const tools = [
    {
      title: "Amortisation Calculator",
      description: "Calculate your loan amortisation schedule with detailed monthly breakdowns.",
      icon: Calculator,
      url: "/tools/amortization-calculator",
      category: "loans",
    },
    {
      title: "Interest Calculator",
      description: "Calculate interest payments and total costs for different types of loans.",
      icon: LineChart,
      url: "/tools/interest-calculator",
      category: "interest",
    },
    {
      title: "Loan Comparison Tool",
      description: "Compare different loan options to find the best rates and terms for you.",
      icon: PiggyBank,
      url: "/tools/loan-comparison-calculator",
      category: "loans",
    },
    {
      title: "Debt-to-Income Calculator",
      description: "Calculate your debt-to-income ratio and understand your financial health.",
      icon: Percent,
      url: "/tools/debt-to-income-calculator",
      category: "debt",
    },
    {
      title: "Credit Card Payoff Calculator",
      description: "Plan your credit card debt payoff strategy and timeline.",
      icon: CreditCard,
      url: "/tools/credit-card-calculator",
      category: "credit",
    },
    {
      title: "Debt Consolidation Calculator",
      description: "Compare debt consolidation options and potential savings.",
      icon: Wallet,
      url: "/tools/debt-consolidation-calculator",
      category: "debt",
    },
    {
      title: "Emergency Fund Calculator",
      description: "Calculate how much you should save for emergencies.",
      icon: DollarSign,
      url: "/tools/emergency-fund-calculator",
      category: "savings",
    },
    {
      title: "Savings Goal Calculator",
      description: "Plan and track your progress towards savings goals.",
      icon: Target,
      url: "/tools/savings-goal-calculator",
      category: "savings",
    },
    {
      title: "Budget Planning Calculator",
      description: "Create a personalized budget plan based on your income and expenses.",
      icon: BarChart3,
      url: "/tools/budget-calculator",
      category: "budget",
    },
  ];

  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1 w-full bg-gray-50">
        <div className="w-full container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Free Financial Tools</h1>
              <p className="text-lg text-gray-600 mb-8">
                Explore our collection of free tools to help you make better financial decisions.
              </p>
              <div className="max-w-md mx-auto">
                <Input
                  type="search"
                  placeholder="Search tools by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full mb-8"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  <div className="flex items-center justify-between">
                    <Button asChild>
                      <Link to={tool.url}>Try Now</Link>
                    </Button>
                    <span className="text-sm text-gray-500 capitalize">{tool.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-50 py-12 border-t border-gray-100 w-full">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="text-xl font-bold text-gray-900 hover:text-primary transition-colors">
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
                  <Link to="/tools" className="hover:text-primary transition-colors">
                    Free Tools
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    About
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
            <p>&copy; 2024 Debtfreeo. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
};

export default FreeTools;
