import { MainLayout } from "@/components/layout/MainLayout";
import { useDebts } from "@/hooks/use-debts";
import { useProfile } from "@/hooks/use-profile";
import { StrategyHeader } from "@/components/strategy/StrategyHeader";
import { StrategyContent } from "@/components/strategy/StrategyContent";
import { StrategyFeatureDescription } from "@/components/strategy/StrategyFeatureDescription";
import { strategies } from "@/lib/strategies";
import type { Strategy } from "@/lib/strategies";
import type { Debt } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { motion } from "framer-motion";
import { NoDebtsMessage } from "@/components/debt/NoDebtsMessage";
import { useState } from "react";

export default function Strategy() {
  const { debts, updateDebt: updateDebtMutation, deleteDebt: deleteDebtMutation, isLoading: isDebtsLoading } = useDebts();
  const { profile, updateProfile, isLoading: isProfileLoading } = useProfile();
  const { oneTimeFundings } = useOneTimeFunding();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>(strategies[0]);
  
  const isLoading = isDebtsLoading || isProfileLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!debts || debts.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-900 dark:to-gray-800">
          <div className="container py-8">
            <StrategyHeader />
            <div className="mt-8">
              <NoDebtsMessage />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleStrategyChange = async (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    
    if (profile) {
      try {
        await updateProfile.mutate({
          ...profile,
          selected_strategy: strategy.id,
        });
      } catch (error) {
        console.error('Error updating strategy:', error);
      }
    }
  };

  const handleDebtUpdate = async (updatedDebt: Debt) => {
    try {
      await updateDebtMutation.mutate(updatedDebt);
    } catch (error) {
      console.error('Error updating debt:', error);
    }
  };

  const handleDebtDelete = async (debtId: string) => {
    try {
      await deleteDebtMutation.mutate(debtId);
    } catch (error) {
      console.error('Error deleting debt:', error);
    }
  };

  const totalDebtValue = debts.reduce((sum, debt) => sum + debt.balance, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-900 dark:to-gray-800">
        <div className="container max-w-7xl py-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StrategyHeader />
          </motion.div>

          <StrategyFeatureDescription />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StrategyContent
              debts={debts}
              selectedStrategy={selectedStrategy}
              onUpdateDebt={handleDebtUpdate}
              onDeleteDebt={handleDebtDelete}
              onSelectStrategy={handleStrategyChange}
              preferredCurrency={profile?.preferred_currency}
              totalDebtValue={totalDebtValue}
            />
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}