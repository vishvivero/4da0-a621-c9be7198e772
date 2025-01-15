import { Debt } from "@/lib/types/debt";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { DollarSign, Percent, MinusCircle } from "lucide-react";

interface PaymentOverviewProps {
  debt: Debt;
  totalPaid: number;
  totalInterest: number;
}

export const PaymentOverview = ({ debt, totalPaid, totalInterest }: PaymentOverviewProps) => {
  const principalReduction = totalPaid - totalInterest;

  const cards = [
    {
      title: "Total Paid",
      amount: totalPaid,
      icon: DollarSign,
      color: "emerald"
    },
    {
      title: "Interest Paid",
      amount: totalInterest,
      icon: Percent,
      color: "blue"
    },
    {
      title: "Principal Reduction",
      amount: principalReduction,
      icon: MinusCircle,
      color: "violet"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Payment Overview</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full bg-${card.color}-500`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <card.icon className={`h-5 w-5 text-${card.color}-500`} />
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {debt.currency_symbol}{card.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};