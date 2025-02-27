
import { useState, useEffect } from "react";
import { useDebts } from "@/hooks/use-debts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Debt } from "@/lib/types/debt";
import { CreditCard, Percent, Wallet, Coins, Info, ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { DebtCategorySelect } from "@/components/debt/DebtCategorySelect";
import { DebtDateSelect } from "@/components/debt/DebtDateSelect";
import { useToast } from "@/components/ui/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { addMonths, format } from "date-fns";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";

interface EditDebtFormProps {
  debt: Debt;
  onSubmit: (updatedDebt: Debt) => void;
}

export const EditDebtForm = ({ debt, onSubmit }: EditDebtFormProps) => {
  const { updateDebt } = useDebts();
  const { toast } = useToast();
  const [name, setName] = useState(debt.name);
  const [category, setCategory] = useState(debt.category || "Credit Card");
  const [balance, setBalance] = useState(debt.balance.toString());
  const [interestRate, setInterestRate] = useState(debt.metadata?.original_rate?.toString() || debt.interest_rate.toString());
  const [minimumPayment, setMinimumPayment] = useState(debt.minimum_payment.toString());
  const [bankerName, setBankerName] = useState(debt.banker_name);
  const [currencySymbol, setCurrencySymbol] = useState(debt.currency_symbol);
  const [date, setDate] = useState<Date>(new Date(debt.next_payment_date || new Date()));
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced options
  const metadata = debt.metadata || {};
  const [isInterestIncluded, setIsInterestIncluded] = useState(metadata.interest_included || false);
  const [remainingMonths, setRemainingMonths] = useState(metadata.remaining_months?.toString() || "");
  const [useRemainingMonths, setUseRemainingMonths] = useState(!!metadata.remaining_months && !metadata.interest_included);
  const [calculatedPrincipal, setCalculatedPrincipal] = useState<number | null>(null);
  const [usePrincipalAsBalance, setUsePrincipalAsBalance] = useState(false);
  
  // Calculate projected payoff date based on remaining months
  const projectedPayoffDate = useRemainingMonths && remainingMonths ? 
    format(addMonths(new Date(), parseInt(remainingMonths)), 'MMMM yyyy') : 
    'Not calculated';

  // Calculate estimated interest rate if possible
  const estimatedInterestRate = useRemainingMonths && balance && minimumPayment && remainingMonths ? 
    calculateEstimatedInterestRate(
      Number(balance), 
      Number(minimumPayment), 
      Number(remainingMonths)
    ) : null;

  // Calculate the original principal when interest is included
  useEffect(() => {
    if (isInterestIncluded && remainingMonths && balance && minimumPayment && interestRate) {
      const principal = InterestCalculator.calculatePrincipalFromTotal(
        Number(balance),
        Number(interestRate),
        Number(minimumPayment),
        Number(remainingMonths)
      );
      setCalculatedPrincipal(principal);
      console.log("Calculated principal:", principal);
      
      // If usePrincipalAsBalance is enabled, update the balance field
      if (usePrincipalAsBalance) {
        setBalance(principal.toFixed(2));
      }
    } else {
      setCalculatedPrincipal(null);
    }
  }, [isInterestIncluded, remainingMonths, balance, minimumPayment, interestRate, usePrincipalAsBalance]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Calculate final interest rate based on advanced settings
      let finalInterestRate = Number(interestRate);
      
      // If using remaining months to calculate interest
      if (useRemainingMonths && estimatedInterestRate !== null) {
        finalInterestRate = estimatedInterestRate;
        console.log("Using calculated interest rate:", finalInterestRate);
      }

      // Determine the final balance to use (either original or principal)
      const finalBalance = usePrincipalAsBalance && calculatedPrincipal !== null
        ? calculatedPrincipal
        : Number(balance);

      const updatedDebt = {
        ...debt,
        name,
        balance: finalBalance,
        interest_rate: finalInterestRate,
        minimum_payment: Number(minimumPayment),
        banker_name: bankerName,
        currency_symbol: currencySymbol,
        category,
        next_payment_date: date.toISOString(),
        metadata: {
          ...debt.metadata,
          interest_included: isInterestIncluded,
          remaining_months: (isInterestIncluded || useRemainingMonths) ? Number(remainingMonths) : null,
          original_rate: isInterestIncluded ? finalInterestRate : null,
          total_with_interest: isInterestIncluded && !usePrincipalAsBalance ? Number(balance) : null,
        }
      };

      console.log("Updating debt with data:", updatedDebt);

      await updateDebt.mutateAsync(updatedDebt);
      toast({
        title: "Success",
        description: "Debt updated successfully",
      });
      onSubmit(updatedDebt);
    } catch (error) {
      console.error("Error updating debt:", error);
      toast({
        title: "Error",
        description: "Failed to update debt",
        variant: "destructive",
      });
    }
  };

  // Calculate estimated interest rate based on loan amount, payment and months
  function calculateEstimatedInterestRate(
    principal: number, 
    monthlyPayment: number, 
    months: number
  ): number | null {
    if (principal <= 0 || monthlyPayment <= 0 || months <= 0) {
      return null;
    }

    // Simple estimation using trial and error approach
    // Start with a reasonable guess (e.g., 5%)
    let rate = 5.0;
    const maxIterations = 100;
    const tolerance = 0.01;
    
    for (let i = 0; i < maxIterations; i++) {
      const monthlyRate = rate / 1200;
      const calculatedPayment = 
        principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
        (Math.pow(1 + monthlyRate, months) - 1);
      
      const diff = calculatedPayment - monthlyPayment;
      
      if (Math.abs(diff) < tolerance) {
        break;
      }
      
      // Adjust rate based on the difference
      if (diff > 0) {
        rate -= 0.1;
      } else {
        rate += 0.1;
      }
      
      // Ensure rate stays reasonable
      if (rate < 0) rate = 0;
      if (rate > 100) rate = 100;
    }
    
    return parseFloat(rate.toFixed(2));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        <DebtCategorySelect value={category} onChange={setCategory} />

        <div className="relative space-y-2">
          <Label className="text-sm font-medium text-gray-700">Debt Name</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-white hover:border-primary/50 transition-colors"
              placeholder="Credit Card, Personal Loan, etc."
              required
            />
          </div>
        </div>

        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">Balance</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Enter the current outstanding balance from your latest statement. For loans, this should be the remaining principal plus any pre-calculated interest if shown in your statement.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Wallet className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="pl-10 bg-white hover:border-primary/50 transition-colors"
              placeholder="10000"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">Interest Rate (%)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter the Annual Percentage Rate (APR) for this debt. For loans with pre-calculated interest in the balance, enter the original interest rate.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Percent className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="pl-10 bg-white hover:border-primary/50 transition-colors"
              placeholder="5.5"
              required={!useRemainingMonths}
              disabled={useRemainingMonths}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">Minimum Payment</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter your fixed monthly payment (EMI) or minimum payment amount. For loans with pre-calculated interest, this is your regular installment amount.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Coins className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="number"
              value={minimumPayment}
              onChange={(e) => setMinimumPayment(e.target.value)}
              className="pl-10 bg-white hover:border-primary/50 transition-colors"
              placeholder="250"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <DebtDateSelect 
          date={date} 
          onSelect={(newDate) => {
            console.log("Date selected in edit form:", newDate);
            newDate && setDate(newDate);
          }} 
        />

        <Collapsible
          open={showAdvanced}
          onOpenChange={setShowAdvanced}
          className="border rounded-md p-4 bg-gray-50"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-medium">Advanced Options</span>
            </div>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="interest-included" className="font-medium">
                    Interest Already Included
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Turn this on if your loan balance already includes all future interest. Common for personal loans and auto loans in some countries.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  The outstanding balance includes all future interest
                </p>
              </div>
              <Switch
                id="interest-included"
                checked={isInterestIncluded}
                onCheckedChange={(checked) => {
                  setIsInterestIncluded(checked);
                  // Can't use both options at once
                  if (checked) {
                    setUseRemainingMonths(false);
                    // Require remaining months if interest is included
                    if (!remainingMonths) {
                      setRemainingMonths("12");
                    }
                  } else {
                    // Reset this option when turning off interest included
                    setUsePrincipalAsBalance(false);
                  }
                }}
              />
            </div>

            {isInterestIncluded && (
              <div className="mt-4">
                <Label htmlFor="remaining-months" className="text-sm font-medium">
                  Remaining Months
                </Label>
                <Input
                  id="remaining-months"
                  type="number"
                  value={remainingMonths}
                  onChange={(e) => setRemainingMonths(e.target.value)}
                  placeholder="36"
                  className="mt-1"
                  min="1"
                  required={isInterestIncluded}
                />
                
                {balance && minimumPayment && remainingMonths && interestRate && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-sm font-medium text-blue-800">
                      Estimated payoff: {format(addMonths(new Date(), parseInt(remainingMonths)), 'MMMM yyyy')}
                    </p>
                    <p className="text-sm font-medium text-blue-800 mt-1">
                      Original interest rate: {interestRate}%
                    </p>
                    {calculatedPrincipal !== null && (
                      <>
                        <p className="text-sm font-medium text-blue-800 mt-1">
                          Calculated principal: {currencySymbol}{calculatedPrincipal.toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </p>
                        <p className="text-sm font-medium text-blue-800 mt-1">
                          Interest amount: {currencySymbol}{(Number(balance) - calculatedPrincipal).toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <Label htmlFor="use-principal" className="font-medium text-blue-800">
                            Use principal as balance
                          </Label>
                          <Switch
                            id="use-principal"
                            checked={usePrincipalAsBalance}
                            onCheckedChange={setUsePrincipalAsBalance}
                          />
                        </div>
                        {usePrincipalAsBalance && (
                          <p className="text-sm text-blue-600 mt-2">
                            Balance will be updated to the calculated principal amount
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="use-months" className="font-medium">
                      Calculate Interest from Remaining Months
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>If you know how many months are left on your loan, we can calculate the interest rate for you. This is useful when you don't know the exact interest rate but know the payoff timeline.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Calculate interest rate from payment schedule
                  </p>
                </div>
                <Switch
                  id="use-months"
                  checked={useRemainingMonths}
                  onCheckedChange={(checked) => {
                    setUseRemainingMonths(checked);
                    // Can't use both options at once
                    if (checked) {
                      setIsInterestIncluded(false);
                      setUsePrincipalAsBalance(false);
                    }
                  }}
                />
              </div>

              {useRemainingMonths && (
                <div className="mt-4">
                  <Label htmlFor="remaining-months" className="text-sm font-medium">
                    Remaining Months
                  </Label>
                  <Input
                    id="remaining-months"
                    type="number"
                    value={remainingMonths}
                    onChange={(e) => setRemainingMonths(e.target.value)}
                    placeholder="36"
                    className="mt-1"
                    min="1"
                    required={useRemainingMonths}
                  />
                  
                  {balance && minimumPayment && remainingMonths && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <p className="text-sm font-medium text-blue-800">
                        Estimated payoff: {projectedPayoffDate}
                      </p>
                      {estimatedInterestRate !== null && (
                        <p className="text-sm font-medium text-blue-800 mt-1">
                          Estimated interest rate: {estimatedInterestRate}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-white transition-colors"
      >
        Save Changes
      </Button>
    </form>
  );
};
