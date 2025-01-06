import { useState, useEffect } from "react";
import { DebtTable } from "./DebtTable";
import { DecimalToggle } from "./DecimalToggle";
import { DeleteDebtDialog } from "./DeleteDebtDialog";
import { Debt } from "@/lib/types/debt";
import { strategies } from "@/lib/calculations";
import { calculatePayoffDetails } from "@/lib/calculations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "./ui/button";
import { FileDown } from "lucide-react";
import { generateDebtOverviewPDF } from "@/lib/utils/pdfGenerator";
import { useToast } from "./ui/use-toast";
import { countryCurrencies } from "@/lib/utils/currency-data";

interface DebtTableContainerProps {
  debts: Debt[];
  monthlyPayment?: number;
  onUpdateDebt: (updatedDebt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
  currencySymbol?: string;
  selectedStrategy?: string;
}

export const DebtTableContainer = ({
  debts,
  monthlyPayment = 0,
  onUpdateDebt,
  onDeleteDebt,
  currencySymbol = '£',
  selectedStrategy = 'avalanche'
}: DebtTableContainerProps) => {
  const [showDecimals, setShowDecimals] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);
  const [oneTimeFundings, setOneTimeFundings] = useState<{ amount: number; payment_date: Date }[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Log the currency symbol being used
  console.log('DebtTableContainer: Using currency symbol:', currencySymbol);

  const fetchOneTimeFundings = async () => {
    if (!user) return;
    
    console.log('Fetching one-time fundings for user:', user.id);
    const { data, error } = await supabase
      .from('one_time_funding')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_applied', false)
      .gte('payment_date', new Date().toISOString());

    if (error) {
      console.error('Error fetching one-time fundings:', error);
      return;
    }

    const mappedFundings = data.map(funding => ({
      amount: funding.amount,
      payment_date: new Date(funding.payment_date)
    }));
    
    console.log('Updated one-time fundings:', mappedFundings);
    setOneTimeFundings(mappedFundings);
  };

  useEffect(() => {
    fetchOneTimeFundings();

    const channel = supabase
      .channel('one_time_funding_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'one_time_funding',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('One-time funding inserted:', payload);
          fetchOneTimeFundings();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'one_time_funding',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('One-time funding deleted:', payload);
          fetchOneTimeFundings();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'one_time_funding',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('One-time funding updated:', payload);
          fetchOneTimeFundings();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  console.log('DebtTableContainer: Calculating payoff with strategy:', selectedStrategy);
  const strategy = strategies.find(s => s.id === selectedStrategy) || strategies[0];
  
  const sortedDebts = strategy.calculate([...debts]);
  console.log('DebtTableContainer: Debts sorted according to strategy:', strategy.name);
  
  const payoffDetails = calculatePayoffDetails(sortedDebts, monthlyPayment, strategy, oneTimeFundings);
  console.log('DebtTableContainer: Payoff details calculated:', payoffDetails);

  const handleDownloadPDF = () => {
    try {
      // Calculate monthly allocations for each debt
      const allocations = new Map<string, number>();
      const totalMinimumPayments = sortedDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
      const remainingPayment = monthlyPayment - totalMinimumPayments;
      
      // Distribute minimum payments and extra payment to highest priority debt
      sortedDebts.forEach((debt, index) => {
        const isHighestPriority = index === 0;
        const allocation = debt.minimum_payment + (isHighestPriority ? remainingPayment : 0);
        allocations.set(debt.id, allocation);
      });

      console.log('Generating PDF with allocations:', {
        totalPayment: monthlyPayment,
        minimumPayments: totalMinimumPayments,
        extraPayment: remainingPayment,
        allocations: Array.from(allocations.entries()).map(([id, amount]) => ({
          debtName: sortedDebts.find(d => d.id === id)?.name,
          allocation: amount
        }))
      });

      const doc = generateDebtOverviewPDF(
        sortedDebts,
        allocations,
        payoffDetails,
        monthlyPayment,
        strategy
      );
      doc.save('debt-overview.pdf');
      
      toast({
        title: "Success",
        description: "Debt overview report downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DecimalToggle showDecimals={showDecimals} onToggle={setShowDecimals} />
        <Button 
          onClick={handleDownloadPDF}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Download Overview Report
        </Button>
      </div>
      
      <div className="rounded-lg border bg-white/50 backdrop-blur-sm overflow-hidden">
        <DebtTable
          debts={sortedDebts}
          payoffDetails={payoffDetails}
          onUpdateDebt={onUpdateDebt}
          onDeleteClick={setDebtToDelete}
          showDecimals={showDecimals}
          currencySymbol={currencySymbol}
        />
      </div>

      <DeleteDebtDialog
        debt={debtToDelete}
        onClose={() => setDebtToDelete(null)}
        onConfirm={() => {
          if (debtToDelete) {
            onDeleteDebt(debtToDelete.id);
            setDebtToDelete(null);
          }
        }}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};