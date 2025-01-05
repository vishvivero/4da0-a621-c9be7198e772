import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDebts } from "@/hooks/use-debts";
import { Debt } from "@/lib/types/debt";
import { strategies } from "@/lib/strategies";
import { calculateSingleDebtPayoff } from "@/lib/utils/payment/standardizedCalculations";
import { MainLayout } from "@/components/layout/MainLayout";
import { DebtDetails } from "@/components/debt/DebtDetails";

export const DebtDetailsPage = () => {
  const { debtId } = useParams<{ debtId: string }>();
  const { debts } = useDebts();
  const debt = debts?.find(d => d.id === debtId) as Debt;

  const [monthlyPayment, setMonthlyPayment] = useState(debt?.minimum_payment || 0);
  const [selectedStrategy, setSelectedStrategy] = useState('avalanche');

  if (!debt) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Debt not found. The requested debt may have been deleted or you may not have permission to view it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const strategy = strategies.find(s => s.id === selectedStrategy) || strategies[0];
  const payoffDetails = calculateSingleDebtPayoff(debt, monthlyPayment, strategy);

  console.log('DebtDetailsPage rendering with:', {
    debtId,
    debt,
    monthlyPayment,
    selectedStrategy,
    payoffDetails
  });

  return (
    <MainLayout>
      <DebtDetails 
        debt={debt} 
        payoffDetails={payoffDetails} 
        onMonthlyPaymentChange={setMonthlyPayment} 
        onStrategyChange={setSelectedStrategy} 
      />
    </MainLayout>
  );
};