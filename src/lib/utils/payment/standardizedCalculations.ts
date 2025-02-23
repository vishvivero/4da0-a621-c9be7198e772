
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { addMonths } from "date-fns";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";
import { PaymentProcessor } from "@/lib/services/calculations/core/PaymentProcessor";
import { StandardizedDebtCalculator } from "@/lib/services/calculations/StandardizedDebtCalculator";

export interface PayoffDetails {
  months: number;
  totalInterest: number;
  payoffDate: Date;
  redistributionHistory?: {
    fromDebtId: string;
    amount: number;
    month: number;
  }[];
}

export interface AmortizationEntry {
  date: Date;
  startingBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
  remainingBalance: number;
}

// Gold loan specific calculations
export const validateGoldLoan = (debt: Debt): boolean => {
  if (!debt.is_gold_loan) return true;
  
  const isValid = 
    debt.loan_term_months !== undefined &&
    debt.loan_term_months > 0 &&
    debt.final_payment_date !== undefined;

  console.log('Validating gold loan:', {
    debtName: debt.name,
    isValid,
    termMonths: debt.loan_term_months,
    finalDate: debt.final_payment_date
  });

  return isValid;
};

export const calculateGoldLoanSchedule = (debt: Debt): AmortizationEntry[] => {
  if (!debt.is_gold_loan || !validateGoldLoan(debt)) {
    throw new Error(`Invalid gold loan configuration for debt: ${debt.name}`);
  }

  const schedule: AmortizationEntry[] = [];
  let currentDate = debt.next_payment_date ? new Date(debt.next_payment_date) : new Date();
  const monthlyInterest = (debt.balance * debt.interest_rate) / 100 / 12;
  const maturityDate = new Date(debt.final_payment_date!);

  console.log('Calculating gold loan schedule:', {
    debtName: debt.name,
    balance: debt.balance,
    monthlyInterest,
    maturityDate
  });

  while (currentDate <= maturityDate) {
    const isMaturityMonth = currentDate.getMonth() === maturityDate.getMonth() &&
                           currentDate.getFullYear() === maturityDate.getFullYear();

    const entry: AmortizationEntry = {
      date: new Date(currentDate),
      startingBalance: debt.balance,
      payment: isMaturityMonth ? debt.balance + monthlyInterest : monthlyInterest,
      principal: isMaturityMonth ? debt.balance : 0,
      interest: monthlyInterest,
      endingBalance: isMaturityMonth ? 0 : debt.balance,
      remainingBalance: isMaturityMonth ? 0 : debt.balance
    };

    schedule.push(entry);
    currentDate = addMonths(currentDate, 1);
  }

  return schedule;
};

// Calculate monthly interest for a given balance and annual rate
export const calculateMonthlyInterest = (balance: number, annualRate: number): number => {
  return InterestCalculator.calculateMonthlyInterest(balance, annualRate);
};

// Add the new utility functions
export const isDebtPayable = (debt: Debt): boolean => {
  if (debt.is_gold_loan) return true; // Gold loans are always payable as they're interest-only
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return debt.minimum_payment > monthlyInterest;
};

export const getMinimumViablePayment = (debt: Debt): number => {
  if (debt.is_gold_loan) {
    return calculateMonthlyInterest(debt.balance, debt.interest_rate);
  }
  const monthlyInterest = calculateMonthlyInterest(debt.balance, debt.interest_rate);
  return Math.ceil(monthlyInterest + 1);
};

// Calculate amortization schedule for a single debt
export const calculateAmortizationSchedule = (
  debt: Debt,
  monthlyPayment: number
): AmortizationEntry[] => {
  console.log('Calculating amortization schedule for:', {
    debtName: debt.name,
    initialBalance: debt.balance,
    monthlyPayment
  });

  // For gold loans, use specialized schedule calculation
  if (debt.is_gold_loan) {
    return calculateGoldLoanSchedule(debt);
  }

  const schedule: AmortizationEntry[] = [];
  let currentBalance = debt.balance;
  let currentDate = debt.next_payment_date ? new Date(debt.next_payment_date) : new Date();
  const monthlyRate = debt.interest_rate / 1200;

  while (currentBalance > 0.01) {
    const monthlyInterest = Number((currentBalance * monthlyRate).toFixed(2));
    const payment = Math.min(monthlyPayment, currentBalance + monthlyInterest);
    const principal = Number((payment - monthlyInterest).toFixed(2));
    const endingBalance = Math.max(0, Number((currentBalance - principal).toFixed(2)));

    schedule.push({
      date: new Date(currentDate),
      startingBalance: currentBalance,
      payment,
      principal,
      interest: monthlyInterest,
      endingBalance,
      remainingBalance: endingBalance
    });

    if (endingBalance === 0) break;
    currentBalance = endingBalance;
    currentDate = addMonths(currentDate, 1);
  }

  console.log('Amortization schedule calculated:', {
    debtName: debt.name,
    totalMonths: schedule.length,
    finalBalance: schedule[schedule.length - 1].endingBalance
  });

  return schedule;
};
