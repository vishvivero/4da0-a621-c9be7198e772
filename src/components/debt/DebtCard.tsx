import { Debt } from "@/lib/types/debt";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { EditDebtDialog } from "./EditDebtDialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";

interface DebtCardProps {
  debt: Debt;
  onDelete: (id: string) => void;
  calculatePayoffYears: (debt: Debt) => string;
}

export const DebtCard = ({
  debt,
  onDelete,
  calculatePayoffYears
}: DebtCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      console.log('Fetching payment history for debt:', debt.id);
      
      const { data: payments, error } = await supabase
        .from('payment_history')
        .select('total_payment')
        .eq('user_id', debt.user_id)
        .gte('payment_date', debt.created_at);

      if (error) {
        console.error('Error fetching payment history:', error);
        return;
      }

      const totalAmount = payments?.reduce((sum, payment) => sum + payment.total_payment, 0) || 0;
      console.log('Total amount paid:', totalAmount);
      setTotalPaid(totalAmount);
    };

    fetchPaymentHistory();
  }, [debt.id, debt.user_id, debt.created_at]);

  const getPayoffDetails = (debt: Debt): { months: number; formattedTime: string; progressPercentage: number } => {
    console.log('Calculating payoff details for debt:', {
      name: debt.name,
      balance: debt.balance,
      rate: debt.interest_rate,
      payment: debt.minimum_payment,
      totalPaid,
      metadata: debt.metadata
    });

    // Check if this is a debt with interest already included
    const isInterestIncluded = debt.metadata?.interest_included === true;
    
    let months = 0;
    let effectiveBalance = debt.balance;

    if (isInterestIncluded) {
      // For loans with interest included, simply divide total by monthly payment
      months = Math.ceil(debt.balance / debt.minimum_payment);
      console.log('Interest included calculation:', {
        totalBalance: debt.balance,
        monthlyPayment: debt.minimum_payment,
        months
      });
    } else if (debt.interest_rate === 0) {
      // For zero-interest debts, use simple division
      if (debt.minimum_payment <= 0) {
        console.log('Zero interest debt with no minimum payment');
        return { months: 0, formattedTime: "Never", progressPercentage: 0 };
      }
      
      months = Math.ceil(debt.balance / debt.minimum_payment);
      
      console.log('Zero interest calculation:', {
        balance: debt.balance,
        payment: debt.minimum_payment,
        months
      });
    } else {
      // For standard interest-bearing debts, use the compound interest formula
      const monthlyRate = debt.interest_rate / 1200;
      const monthlyPayment = debt.minimum_payment;
      
      // If payment is too low to cover interest, debt can't be paid off
      const monthlyInterestAmount = debt.balance * monthlyRate;
      if (monthlyPayment <= monthlyInterestAmount) {
        console.log('Payment cannot cover interest:', {
          payment: monthlyPayment,
          monthlyInterest: monthlyInterestAmount
        });
        return { months: 0, formattedTime: "Never", progressPercentage: 0 };
      }

      // Calculate using the standard formula for number of payments
      months = Math.ceil(
        Math.log(monthlyPayment / (monthlyPayment - debt.balance * monthlyRate)) / 
        Math.log(1 + monthlyRate)
      );
      
      console.log('Interest-bearing calculation:', {
        balance: debt.balance,
        payment: monthlyPayment,
        monthlyRate,
        months
      });
    }

    // For progress calculation, use the appropriate balance
    if (isInterestIncluded) {
      // For loans with interest included, use the calculated principal for progress
      const calculatedPrincipal = InterestCalculator.calculatePrincipalFromTotal(
        debt.balance,
        debt.interest_rate,
        debt.minimum_payment,
        months
      );
      effectiveBalance = calculatedPrincipal > 0 ? calculatedPrincipal : debt.balance;
    }

    // Calculate progress percentage
    const originalBalance = effectiveBalance + totalPaid;
    const progressPercentage = originalBalance > 0 ? (totalPaid / originalBalance) * 100 : 0;
    
    console.log('Progress calculation:', {
      originalBalance,
      currentBalance: effectiveBalance,
      totalPaid,
      months,
      progressPercentage
    });
    
    // Format the time string
    const years = Math.floor(months / 12);
    const remainingMonths = Math.ceil(months % 12);
    
    let formattedTime = "";
    if (years === 0) {
      formattedTime = `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else {
      formattedTime = `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }

    return { 
      months, 
      formattedTime, 
      progressPercentage: Number(progressPercentage.toFixed(1))
    };
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.scrollTo(0, 0);
    navigate(`/overview/debt/${debt.id}`);
  };

  // Calculate principal for debts with interest included
  const calculatePrincipal = (): number | null => {
    if (debt.metadata?.interest_included && debt.metadata.remaining_months) {
      return InterestCalculator.calculatePrincipalFromTotal(
        debt.balance,
        debt.interest_rate,
        debt.minimum_payment,
        debt.metadata.remaining_months
      );
    }
    return null;
  };

  // Check if this is a debt with interest included
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const originalRate = debt.metadata?.original_rate || debt.interest_rate;
  const payoffDetails = getPayoffDetails(debt);

  // Calculate principal amount for display
  const calculatedPrincipal = calculatePrincipal();
  
  // Determine what to display for balance
  const displayBalance = isInterestIncluded && calculatedPrincipal !== null 
    ? calculatedPrincipal 
    : debt.balance;

  // Determine what interest rate to display
  const displayInterestRate = isInterestIncluded ? originalRate : debt.interest_rate;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{debt.name}</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(debt.id)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-gray-600 mb-1">Balance</p>
            <p className="text-2xl font-semibold">
              {debt.currency_symbol}{displayBalance.toLocaleString()}
            </p>
            {isInterestIncluded && calculatedPrincipal !== null && (
              <p className="text-xs text-blue-600">
                Principal only (interest excluded)
              </p>
            )}
          </div>
          <div>
            <p className="text-gray-600 mb-1">Monthly Payment</p>
            <p className="text-2xl font-semibold">
              {debt.currency_symbol}{debt.minimum_payment.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">APR</p>
            <p className="text-2xl font-semibold">
              {displayInterestRate}%
              {isInterestIncluded && (
                <span className="ml-2 text-xs font-normal text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                  Interest Included
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900">Progress</h4>
              <span className="text-sm font-medium text-gray-600">
                {payoffDetails.progressPercentage}%
              </span>
            </div>
            <Progress value={payoffDetails.progressPercentage} className="h-2" />
          </div>

          <Button 
            onClick={handleViewDetails}
            className="w-full bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-500 hover:to-blue-500 text-white flex items-center justify-center gap-2"
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-500">
              Standard repayment duration (without debt payoff strategy):
            </p>
            <p className="text-sm text-gray-600">
              {payoffDetails.formattedTime}
            </p>
          </div>
        </div>
      </motion.div>

      <EditDebtDialog 
        debt={debt}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};
