
import { CollegeSavingsCalculator } from "@/components/tools/CollegeSavingsCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, GraduationCap } from "lucide-react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const CollegeSavingsCalculatorPage = () => {
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
            to="/tools/college-savings-calculator" 
            className="text-gray-600"
          >
            College Savings Calculator
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
                College Savings Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Plan for future education expenses with our college savings calculator.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <CollegeSavingsCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Planning for College</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How This Calculator Helps</h3>
              <p>
                Our college savings calculator helps you estimate future college costs and determine 
                how much you need to save monthly to reach your education funding goals.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Savings Options</h3>
              <ul