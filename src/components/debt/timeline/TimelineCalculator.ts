
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { format, addMonths } from "date-fns";
import { Strategy } from "@/lib/strategies";

export interface TimelineData {
  date: string;
  monthLabel: string;
  month: number;
  baselineBalance: number;
  acceleratedBalance: number;
  baselineInterest: number;
  acceleratedInterest: number;
  oneTimePayment?: number;
  currencySymbol: string;
}

export const calculateTimelineData = (
  debts: Debt[],
  totalMonthlyPayment: number,
  strategy: Strategy,
  oneTimeFundings: OneTimeFunding[] = []
): TimelineData[] => {
  console.log('Phase 1 - Starting timeline calculation:', {
    totalDebts: debts.length,
    goldLoans: debts.filter(d => d.is_gold_loan).length,
    regularLoans: debts.filter(d => !d.is_gold_loan).length,
    totalMonthlyPayment,
    strategy: strategy.name
  });

  const data: TimelineData[] = [];
  const balances = new Map<string, number>();
  const acceleratedBalances = new Map<string, number>();
  const startDate = new Date();
  let totalBaselineInterest = 0;
  let totalAcceleratedInterest = 0;
  
  // Initialize balances
  debts.forEach(debt => {
    balances.set(debt.id, debt.balance);
    acceleratedBalances.set(debt.id, debt.balance);
    console.log(`Initialized debt ${debt.name}:`, {
      isGoldLoan: debt.is_gold_loan,
      balance: debt.balance,
      term: debt.loan_term_months
    });
  });

  // Calculate gold loan monthly interest
  const calculateGoldLoanInterest = (debt: Debt): number => {
    const balance = debt.balance;
    const monthlyInterest = (balance * debt.interest_rate) / 100 / 12;
    return Number(monthlyInterest.toFixed(2));
  };

  // Check if gold loan is due for balloon payment
  const isGoldLoanMatured = (debt: Debt, currentDate: Date): boolean => {
    if (!debt.is_gold_loan || !debt.final_payment_date) return false;
    const maturityDate = new Date(debt.final_payment_date);
    return currentDate >= maturityDate;
  };

  const totalMinimumPayment = debts.reduce((sum, debt) => {
    if (debt.is_gold_loan) {
      return sum + calculateGoldLoanInterest(debt);
    }
    return sum + debt.minimum_payment;
  }, 0);

  let month = 0;
  const maxMonths = 360; // 30 years cap

  while (month < maxMonths) {
    const currentDate = addMonths(startDate, month);
    
    // Get monthly fundings
    const monthlyFundings = oneTimeFundings.filter(funding => {
      const fundingDate = new Date(funding.payment_date);
      return fundingDate.getMonth() === currentDate.getMonth() &&
             fundingDate.getFullYear() === currentDate.getFullYear();
    });
    
    const oneTimeFundingAmount = monthlyFundings.reduce((sum, funding) => 
      sum + Number(funding.amount), 0);

    // Baseline scenario calculation
    let totalBaselineBalance = 0;
    let monthlyBaselineInterest = 0;
    let remainingBaselinePayment = totalMinimumPayment;

    // Handle gold loans first in baseline
    debts.filter(d => d.is_gold_loan).forEach(debt => {
      const currentBalance = balances.get(debt.id) || 0;
      if (currentBalance > 0) {
        const monthlyInterest = calculateGoldLoanInterest(debt);
        monthlyBaselineInterest += monthlyInterest;

        if (isGoldLoanMatured(debt, currentDate)) {
          // Balloon payment - clear the balance
          balances.set(debt.id, 0);
          console.log(`Gold loan ${debt.name} matured:`, {
            finalBalance: 0,
            month,
            date: format(currentDate, 'yyyy-MM-dd')
          });
        } else {
          // Interest-only payment - balance stays the same
          balances.set(debt.id, currentBalance);
        }
        
        remainingBaselinePayment -= monthlyInterest;
        totalBaselineBalance += balances.get(debt.id) || 0;
      }
    });

    // Handle regular loans in baseline
    debts.filter(d => !d.is_gold_loan).forEach(debt => {
      const currentBalance = balances.get(debt.id) || 0;
      if (currentBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const baselineInterest = currentBalance * monthlyRate;
        monthlyBaselineInterest += baselineInterest;

        const payment = Math.min(remainingBaselinePayment, debt.minimum_payment);
        const newBalance = Math.max(0, currentBalance + baselineInterest - payment);
        
        remainingBaselinePayment -= payment;
        balances.set(debt.id, newBalance);
        totalBaselineBalance += newBalance;
      }
    });

    totalBaselineInterest += monthlyBaselineInterest;

    // Accelerated scenario calculation
    let totalAcceleratedBalance = 0;
    let monthlyAcceleratedInterest = 0;
    let remainingAcceleratedPayment = totalMonthlyPayment + oneTimeFundingAmount;

    // Handle gold loans first in accelerated
    debts.filter(d => d.is_gold_loan).forEach(debt => {
      const currentBalance = acceleratedBalances.get(debt.id) || 0;
      if (currentBalance > 0) {
        const monthlyInterest = calculateGoldLoanInterest(debt);
        monthlyAcceleratedInterest += monthlyInterest;

        if (isGoldLoanMatured(debt, currentDate)) {
          // Balloon payment due
          acceleratedBalances.set(debt.id, 0);
          remainingAcceleratedPayment -= currentBalance + monthlyInterest;
          console.log(`Accelerated gold loan ${debt.name} matured:`, {
            finalBalance: 0,
            month,
            date: format(currentDate, 'yyyy-MM-dd')
          });
        } else {
          // Interest-only payment
          acceleratedBalances.set(debt.id, currentBalance);
          remainingAcceleratedPayment -= monthlyInterest;
        }

        totalAcceleratedBalance += acceleratedBalances.get(debt.id) || 0;
      }
    });

    // Handle regular loans in accelerated with strategy
    const regularDebts = debts.filter(d => !d.is_gold_loan);
    const prioritizedDebts = strategy.calculate(regularDebts);

    // Apply minimum payments first
    prioritizedDebts.forEach(debt => {
      const currentBalance = acceleratedBalances.get(debt.id) || 0;
      if (currentBalance > 0) {
        const monthlyRate = debt.interest_rate / 1200;
        const acceleratedInterest = currentBalance * monthlyRate;
        monthlyAcceleratedInterest += acceleratedInterest;

        const minPayment = Math.min(debt.minimum_payment, currentBalance + acceleratedInterest);
        remainingAcceleratedPayment -= minPayment;
        
        let newBalance = currentBalance + acceleratedInterest - minPayment;
        acceleratedBalances.set(debt.id, Math.max(0, newBalance));
        totalAcceleratedBalance += Math.max(0, newBalance);
      }
    });

    // Apply extra payments according to strategy
    if (remainingAcceleratedPayment > 0) {
      for (const debt of prioritizedDebts) {
        const currentBalance = acceleratedBalances.get(debt.id) || 0;
        if (currentBalance > 0) {
          const extraPayment = Math.min(remainingAcceleratedPayment, currentBalance);
          const newBalance = Math.max(0, currentBalance - extraPayment);
          acceleratedBalances.set(debt.id, newBalance);
          remainingAcceleratedPayment -= extraPayment;
          totalAcceleratedBalance = Array.from(acceleratedBalances.values())
            .reduce((sum, balance) => sum + balance, 0);
          
          if (remainingAcceleratedPayment <= 0) break;
        }
      }
    }

    totalAcceleratedInterest += monthlyAcceleratedInterest;

    // Add data point
    data.push({
      date: currentDate.toISOString(),
      monthLabel: format(currentDate, 'MMM yyyy'),
      month,
      baselineBalance: Number(totalBaselineBalance.toFixed(2)),
      acceleratedBalance: Number(totalAcceleratedBalance.toFixed(2)),
      baselineInterest: Number(totalBaselineInterest.toFixed(2)),
      acceleratedInterest: Number(totalAcceleratedInterest.toFixed(2)),
      oneTimePayment: oneTimeFundingAmount || undefined,
      currencySymbol: debts[0].currency_symbol
    });

    // Break if both scenarios are paid off
    if (totalBaselineBalance <= 0.01 && totalAcceleratedBalance <= 0.01) {
      break;
    }

    month++;
  }

  console.log('Phase 1 - Timeline calculation complete:', {
    totalMonths: month,
    dataPoints: data.length,
    finalBaselineBalance: data[data.length - 1].baselineBalance,
    finalAcceleratedBalance: data[data.length - 1].acceleratedBalance,
    totalBaselineInterest: Number(totalBaselineInterest.toFixed(2)),
    totalAcceleratedInterest: Number(totalAcceleratedInterest.toFixed(2)),
    interestSaved: Number((totalBaselineInterest - totalAcceleratedInterest).toFixed(2))
  });

  return data;
};
