import { motion } from "framer-motion";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { formatCurrency } from "@/lib/strategies";

interface ResultsSummaryProps {
  interestSaved: number;
  monthsSaved: number;
  payoffDate: Date;
  currencySymbol?: string;
}

export const ResultsSummary = ({
  interestSaved,
  monthsSaved,
  payoffDate,
  currencySymbol = '£'
}: ResultsSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-green-50 p-4 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Interest Saved</h3>
        </div>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(interestSaved, currencySymbol)}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 p-4 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Time Saved</h3>
        </div>
        <p className="text-2xl font-bold text-blue-600">
          {monthsSaved} months
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-purple-50 p-4 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-800">Debt-free Date</h3>
        </div>
        <p className="text-2xl font-bold text-purple-600">
          {payoffDate.toLocaleDateString('en-US', { 
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </motion.div>
    </div>
  );
};