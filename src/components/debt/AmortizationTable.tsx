
import { useMemo } from 'react';
import { AmortizationEntry } from "@/lib/utils/payment/standardizedCalculations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface AmortizationTableProps {
  debt: {
    name: string;
  };
  amortizationData: AmortizationEntry[];
  currencySymbol: string;
}

export const AmortizationTable = ({ debt, amortizationData, currencySymbol }: AmortizationTableProps) => {
  const memoizedData = useMemo(() => amortizationData, [amortizationData]);

  if (!memoizedData || memoizedData.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Amortization Schedule for {debt.name}</h2>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Remaining Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoizedData.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{format(entry.date, 'MMM d, yyyy')}</TableCell>
                <TableCell>{currencySymbol}{entry.payment.toFixed(2)}</TableCell>
                <TableCell>{currencySymbol}{entry.principal.toFixed(2)}</TableCell>
                <TableCell>{currencySymbol}{entry.interest.toFixed(2)}</TableCell>
                <TableCell>{currencySymbol}{entry.remainingBalance.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
