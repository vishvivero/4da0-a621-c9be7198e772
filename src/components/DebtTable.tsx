import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Debt, formatCurrency, calculatePayoffTime } from "@/lib/strategies";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditDebtForm } from "./EditDebtForm";
import { useState } from "react";

interface DebtTableProps {
  debts: Debt[];
  monthlyPayment?: number;
  onUpdateDebt: (updatedDebt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
  currencySymbol?: string;
}

export const DebtTable = ({ 
  debts, 
  monthlyPayment = 0, 
  onUpdateDebt, 
  onDeleteDebt,
  currencySymbol = '$' 
}: DebtTableProps) => {
  const [showDecimals, setShowDecimals] = useState(false);

  const formatMoneyValue = (value: number) => {
    const formattedValue = showDecimals ? value : Math.round(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(formattedValue).replace('$', currencySymbol);
  };

  const formatInterestRate = (value: number) => {
    return value.toFixed(2) + '%';
  };

  const calculateTotalInterest = (debt: Debt, monthlyPayment: number) => {
    if (monthlyPayment <= 0) return 0;

    let balance = debt.balance;
    let totalInterest = 0;
    const monthlyRate = debt.interest_rate / 1200;

    while (balance > 0) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      
      const principalPayment = Math.min(monthlyPayment - interest, balance);
      balance = Math.max(0, balance - principalPayment);

      if (monthlyPayment <= interest) break; // Prevent infinite loop if payment is too small
    }

    return totalInterest;
  };

  const calculatePayoffDate = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const calculateProposedPayment = (debt: Debt, index: number) => {
    if (monthlyPayment <= 0) return debt.minimum_payment;

    // Calculate total minimum payments for all remaining debts
    const remainingDebtsMinPayments = debts
      .slice(index)
      .reduce((sum, d) => sum + d.minimum_payment, 0);

    // For the current focus debt (first in strategy order), allocate extra payment
    if (index === 0) {
      const extraPayment = monthlyPayment - remainingDebtsMinPayments;
      return debt.minimum_payment + extraPayment;
    }

    // Other debts receive their minimum payment
    return debt.minimum_payment;
  };

  const totals = debts.reduce(
    (acc, debt, index) => {
      const proposedPayment = calculateProposedPayment(debt, index);
      const months = calculatePayoffTime(debt, proposedPayment);
      const totalInterest = calculateTotalInterest(debt, proposedPayment);
      return {
        balance: acc.balance + debt.balance,
        minimumPayment: acc.minimumPayment + debt.minimum_payment,
        totalInterest: acc.totalInterest + totalInterest,
      };
    },
    { balance: 0, minimumPayment: 0, totalInterest: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <Switch
          id="show-decimals"
          checked={showDecimals}
          onCheckedChange={setShowDecimals}
        />
        <Label htmlFor="show-decimals">Show decimals</Label>
      </div>
      
      <div className="rounded-lg border bg-white/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Banking Institution</TableHead>
              <TableHead className="text-center">Debt Name</TableHead>
              <TableHead className="text-center">Balance</TableHead>
              <TableHead className="text-center">Interest Rate</TableHead>
              <TableHead className="text-center">Minimum Payment</TableHead>
              <TableHead className="text-center">Proposed Payment</TableHead>
              <TableHead className="text-center">Total Interest Paid</TableHead>
              <TableHead className="text-center">Months to Payoff</TableHead>
              <TableHead className="text-center">Payoff Date</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((debt, index) => {
              const proposedPayment = calculateProposedPayment(debt, index);
              const months = calculatePayoffTime(debt, proposedPayment);
              const totalInterest = calculateTotalInterest(debt, proposedPayment);
              
              return (
                <motion.tr
                  key={debt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-muted/50"
                >
                  <TableCell>{debt.banker_name}</TableCell>
                  <TableCell className="font-medium">{debt.name}</TableCell>
                  <TableCell className="number-font">{formatMoneyValue(debt.balance)}</TableCell>
                  <TableCell className="number-font">{formatInterestRate(debt.interest_rate)}</TableCell>
                  <TableCell className="number-font">{formatMoneyValue(debt.minimum_payment)}</TableCell>
                  <TableCell className="number-font">{formatMoneyValue(proposedPayment)}</TableCell>
                  <TableCell className="number-font">{formatMoneyValue(totalInterest)}</TableCell>
                  <TableCell className="number-font">{months} months</TableCell>
                  <TableCell className="number-font">{calculatePayoffDate(months)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Debt</DialogTitle>
                          </DialogHeader>
                          <EditDebtForm debt={debt} onSubmit={onUpdateDebt} />
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDeleteDebt(debt.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
            <TableRow className="font-bold bg-muted/20">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="number-font">{formatMoneyValue(totals.balance)}</TableCell>
              <TableCell>-</TableCell>
              <TableCell className="number-font">{formatMoneyValue(totals.minimumPayment)}</TableCell>
              <TableCell className="number-font">{formatMoneyValue(monthlyPayment)}</TableCell>
              <TableCell className="number-font">{formatMoneyValue(totals.totalInterest)}</TableCell>
              <TableCell colSpan={3}>-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};