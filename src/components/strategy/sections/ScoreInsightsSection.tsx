import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Award, AlertCircle, CheckCircle2, Coins, Clock, Zap } from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { calculateDebtScore, getScoreCategory } from "@/lib/utils/scoring/debtScoreCalculator";
import { unifiedDebtCalculationService } from "@/lib/services/UnifiedDebtCalculationService";
import { strategies } from "@/lib/strategies";

export const ScoreInsightsSection = () => {
  const { debts, profile } = useDebts();

  if (!debts || debts.length === 0 || !profile?.monthly_payment) {
    return null;
  }

  const selectedStrategy = strategies.find(s => s.id === profile?.selected_strategy) || strategies[0];
  
  const originalPayoff = unifiedDebtCalculationService.calculatePayoffDetails(
    debts,
    debts.reduce((sum, debt) => sum + debt.minimum_payment, 0),
    selectedStrategy,
    []
  );

  const optimizedPayoff = unifiedDebtCalculationService.calculatePayoffDetails(
    debts,
    profile.monthly_payment,
    selectedStrategy,
    []
  );

  const scoreDetails = calculateDebtScore(
    debts,
    originalPayoff,
    optimizedPayoff,
    selectedStrategy,
    profile.monthly_payment
  );

  const scoreCategory = getScoreCategory(scoreDetails.totalScore);

  const getDetailedRecommendations = () => {
    const recommendations = [];
    const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    const highestInterestDebt = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0];
    const lowestBalanceDebt = [...debts].sort((a, b) => a.balance - b.balance)[0];

    // Interest Score Recommendations
    if (scoreDetails.interestScore < 25) {
      recommendations.push({
        text: `Focus on paying off your ${highestInterestDebt.name} first with ${highestInterestDebt.interest_rate}% interest rate to reduce overall interest costs.`,
        icon: <Coins className="h-5 w-5 text-yellow-500" />,
        priority: 1
      });
    }

    // Duration Score Recommendations
    if (scoreDetails.durationScore < 15) {
      const extraPaymentNeeded = Math.ceil((totalMinPayments * 0.2) / 10) * 10; // Round to nearest 10
      recommendations.push({
        text: `Consider increasing your monthly payment by ${profile.preferred_currency}${extraPaymentNeeded} to significantly reduce your payoff timeline.`,
        icon: <Clock className="h-5 w-5 text-blue-500" />,
        priority: 2
      });
    }

    // Payment Behavior Recommendations
    if (scoreDetails.behaviorScore.ontimePayments < 5) {
      recommendations.push({
        text: "Set up automatic payments to ensure consistent, on-time payments and improve your payment behavior score.",
        icon: <Zap className="h-5 w-5 text-purple-500" />,
        priority: 3
      });
    }

    // Strategy Optimization
    if (scoreDetails.behaviorScore.strategyUsage < 5) {
      const suggestedStrategy = highestInterestDebt.interest_rate > 15 ? "avalanche" : "snowball";
      if (suggestedStrategy !== selectedStrategy.id) {
        recommendations.push({
          text: `Switch to the ${suggestedStrategy} method to optimize your debt payoff strategy based on your current debt profile.`,
          icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
          priority: 4
        });
      }
    }

    // Extra Payment Recommendations
    if (scoreDetails.behaviorScore.excessPayments < 2.5) {
      const smallestExtra = Math.ceil((lowestBalanceDebt.minimum_payment * 0.1) / 5) * 5; // Round to nearest 5
      recommendations.push({
        text: `Start small: add just ${profile.preferred_currency}${smallestExtra} extra to your monthly payment to build momentum.`,
        icon: <Target className="h-5 w-5 text-indigo-500" />,
        priority: 5
      });
    }

    // If score is good, provide maintenance advice
    if (scoreDetails.totalScore >= 80) {
      recommendations.push({
        text: "Your debt management strategy is solid! Consider setting up an emergency fund to prevent future debt.",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        priority: 6
      });
    }

    // If no specific recommendations, provide a default one
    if (recommendations.length === 0) {
      recommendations.push({
        text: "Keep monitoring your debt repayment progress and stay consistent with your payments.",
        icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
        priority: 7
      });
    }

    // Sort by priority and return the most relevant recommendation
    return recommendations.sort((a, b) => a.priority - b.priority)[0];
  };

  const recommendation = getDetailedRecommendations();

  const getRecommendationStyle = (score: number) => {
    if (score < 50) return "bg-destructive/5 border-destructive/10";
    if (score < 75) return "bg-secondary/5 border-secondary/10";
    return "bg-primary/5 border-primary/10";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Score Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-100"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="364.425"
                  strokeDashoffset={364.425 - (364.425 * scoreDetails.totalScore) / 100}
                  className="text-primary transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {Math.round(scoreDetails.totalScore)}
                </div>
                <div className={`text-sm font-medium ${scoreCategory.color}`}>
                  {scoreCategory.label}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Interest Optimization</span>
                <span className="font-medium">{scoreDetails.interestScore.toFixed(1)}/50</span>
              </div>
              <Progress value={(scoreDetails.interestScore / 50) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Efficiency</span>
                <span className="font-medium">{scoreDetails.durationScore.toFixed(1)}/30</span>
              </div>
              <Progress value={(scoreDetails.durationScore / 30) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Financial Behavior</span>
                <span className="font-medium">
                  {(
                    scoreDetails.behaviorScore.ontimePayments +
                    scoreDetails.behaviorScore.excessPayments +
                    scoreDetails.behaviorScore.strategyUsage
                  ).toFixed(1)}/20
                </span>
              </div>
              <Progress 
                value={
                  ((scoreDetails.behaviorScore.ontimePayments +
                    scoreDetails.behaviorScore.excessPayments +
                    scoreDetails.behaviorScore.strategyUsage) / 20) * 100
                } 
                className="h-2" 
              />
            </div>
          </div>

          {recommendation && (
            <div className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${getRecommendationStyle(scoreDetails.totalScore)}`}>
              <div className="flex items-start gap-3">
                {recommendation.icon}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Personalized Action Step</h4>
                  <p className="text-sm text-gray-600">{recommendation.text}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-xs text-gray-500">
                      Based on your current debt profile and payment patterns
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};