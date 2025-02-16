
import { DebtToIncomeCalculator } from "@/components/tools/DebtToIncomeCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const DebtToIncomeCalculatorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm mb-8"
        >
          <Link 
            to="/tools" 
            className="text-primary hover:underline"
          >
            Tools
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link 
            to="/tools/debt-to-income-ratio-calculator" 
            className="text-gray-600"
          >
            Debt-to-Income Calculator
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
                Debt-to-Income Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Calculate your debt-to-income ratio to understand your financial health.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <DebtToIncomeCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Understanding Your Debt-to-Income Ratio</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">What is DTI?</h3>
              <p>
                Your Debt-to-Income (DTI) ratio is a key financial metric that compares your monthly debt payments to your monthly income. It's an essential indicator that lenders use to evaluate your creditworthiness and financial stability.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Why DTI Matters</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mortgage approval chances</li>
                <li>Loan qualification</li>
                <li>Interest rate determination</li>
                <li>Overall financial health assessment</li>
                <li>Credit application success</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">DTI Ratio Ranges</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>35% or less: Excellent position for loan approval</li>
                <li>36-43%: Good position, still qualify for most loans</li>
                <li>44-49%: Some lenders may still approve</li>
                <li>50% or more: May need to reduce debt before applying</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">How to Improve Your DTI</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pay down existing debt</li>
                <li>Increase your income</li>
                <li>Avoid taking on new debt</li>
                <li>Refinance or consolidate current debts</li>
                <li>Consider debt management programs</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Calculator Features</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Monthly income and debt payment analysis</li>
                  <li>Instant DTI ratio calculation</li>
                  <li>Personalized recommendations</li>
                  <li>Loan qualification insights</li>
                  <li>Interactive what-if scenarios</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">About</h4>
              <p className="text-gray-600">
                Understand your debt-to-income ratio and improve your financial health.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link to="/tools" className="hover:text-[#9b87f5] transition-colors">
                    All Calculators
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-[#9b87f5] transition-colors">
                    Financial Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <LegalFooter />
            </div>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
};

export default DebtToIncomeCalculatorPage;
