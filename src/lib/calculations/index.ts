export * from './core/interestCalculator';
export * from './core/paymentCalculator';
export { calculatePayoffDetails } from './payoff/payoffCalculator';
export * from './types';
export { strategies } from './strategies/debtStrategies';
export { calculateAmortizationSchedule } from './core/amortizationCalculator';

// Utility functions
export const formatCurrency = (amount: number, currencySymbol: string = '£') => {
  return `${currencySymbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};