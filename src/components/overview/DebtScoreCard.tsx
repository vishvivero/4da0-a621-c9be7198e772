
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CheckCircle2, TrendingUp, PiggyBank, Calendar, Info, Target, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebts } from "@/hooks/use-debts";
import { DebtComparison } from "./DebtComparison";
import { calculateDebtScore, getScoreCategory } from "@/lib/utils/scoring/debtScoreCalculator";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { strategies } from "@/lib/strategies";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";

export const DebtScoreCard = () => {
  const { debts, profile } = useDebts();
  
  console.log('Rendering DebtScoreCard with:', {
    debtCount: debts?.length,
    totalBalance: debts?.reduce((sum, debt) => sum + debt.balance, 0),
    monthlyPayment: profile?.monthly_payment,
    profile
  });

  // Calculate total debt and minimum payments
  const totalDebt = debts?.reduce((sum, debt) => sum + debt.balance, 0) || 0;
  const totalMinimumPayments = debts?.reduce((sum, debt) => sum + debt.minimum_payment, 0) || 0;
  
  const hasNoDebts = !debts || debts.length === 0;
  const isDebtFree = debts && debts.length > 0 && totalDebt === 0;
  
  const calculateScore = () => {
    if (!debts || debts.length === 0) return null;

    const effectiveMonthlyPayment = profile?.monthly_payment || totalMinimumPayments;
    const selectedStrategy = strategies.find(s => s.id === profile?.selected_strategy) || strategies[0];
    
    const originalPayoff = unifiedDebtCalculationService.calculatePayoffDetails(
      debts,
      totalMinimumPayments,
      selectedStrategy,
      []
    );

    const optimizedPayoff = unifiedDebtCalculationService.calculatePayoffDetails(
      debts,
      effectiveMonthlyPayment,
      selectedStrategy,
      []
    );

    return calculateDebtScore(
      debts,
      originalPayoff,
      optimizedPayoff,
      selectedStrategy,
      effectiveMonthlyPayment
    );
  };

  const scoreDetails = calculateScore();
  const scoreCategory = scoreDetails ? getScoreCategory(scoreDetails.totalScore) : null;

  const renderActionableInsights = () => {
    if (!scoreDetails || !debts?.length) return null;

    const highestInterestDebt = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0];
    const lowestBalance = [...debts].sort((a, b) => a.balance - b.balance)[0];
    const totalInterest = debts.reduce((sum, debt) => 
      sum + (debt.balance * (debt.interest_rate / 100)), 0
    );

    return (
      <div className="mt-6 space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Action Plan</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-green-100">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Priority Focus</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Focus on {highestInterestDebt.name} with {highestInterestDebt.interest_rate}% APR
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This debt has the highest interest rate and costs you the most
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-blue-100">
                <PiggyBank className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Quick Win</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Target {lowestBalance.name} with {profile?.preferred_currency || '£'}
                  {lowestBalance.balance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Paying this off first will give you momentum
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Monthly Interest Cost</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {profile?.preferred_currency || '£'}{totalInterest.toFixed(2)} per month
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This is what your debt costs you monthly
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Optimization Potential</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {(((scoreDetails.durationScore + scoreDetails.interestScore) / 80) * 100).toFixed(0)}% room for improvement
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Based on your current payment strategy
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            Recommended Next Steps
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Personalized steps based on your debt profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>
          
          <div className="space-y-3">
            {scoreDetails.interestScore < 25 && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Consider consolidating your high-interest debts to reduce overall interest costs
                </p>
              </div>
            )}
            
            {scoreDetails.durationScore < 15 && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Look for opportunities to increase your monthly payment by {profile?.preferred_currency || '£'}50-100
                </p>
              </div>
            )}
            
            {scoreDetails.behaviorScore.excessPayments < 2.5 && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Set up automatic payments to ensure consistent debt reduction
                </p>
              </div>
            )}

            {debts.some(debt => debt.interest_rate > 20) && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  You have high-interest debt(s). Prioritize paying these off first
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (hasNoDebts) {
      return <NoDebtsMessage />;
    }

    if (isDebtFree) {
      return (
        <div className="text-center space-y-6 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-emerald-50 rounded-full"
          >
            <div className="w-12 h-12 text-emerald-600">🎉</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold text-emerald-600">
              Congratulations! You're Debt-Free!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              You've achieved financial freedom! Keep up the great work and consider your next financial goals.
            </p>
          </motion.div>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-shrink-0 w-full md:w-auto">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">DEBT FREEDOM SCORE</h3>
              </div>
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                  <div className="text-6xl font-bold text-gray-900">
                    {Math.round(scoreDetails?.totalScore || 0)}
                  </div>
                  <div className={`font-medium text-lg ${scoreCategory?.color}`}>
                    {scoreCategory?.label}
                  </div>
                </div>
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    className="text-gray-100"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#scoreGradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray="553"
                    strokeDashoffset={553 - (553 * (scoreDetails?.totalScore || 0)) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="75%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </div>
            </div>
          </div>
          <div className="flex-grow w-full">
            {renderActionableInsights()}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <DebtComparison />
        </div>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="bg-white p-6 relative overflow-hidden">
        {renderContent()}
      </Card>
    </motion.div>
  );
};
