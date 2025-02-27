
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Debt } from "@/lib/types";
import { OneTimeFunding } from "@/lib/types/payment";
import { format, parseISO, addMonths } from "date-fns";

interface TimelineChartProps {
  debts: Debt[];
  baselineMonths: number;
  acceleratedMonths: number;
  currencySymbol: string;
  oneTimeFundings: OneTimeFunding[];
  customTooltip: any;
}

export const TimelineChart = ({ 
  debts,
  baselineMonths,
  acceleratedMonths,
  currencySymbol,
  oneTimeFundings,
  customTooltip: TooltipComponent 
}: TimelineChartProps) => {
  // Generate timeline data with compound interest
  const generateTimelineData = () => {
    if (!debts.length) return [];

    const startDate = new Date();
    const maxMonths = Math.max(baselineMonths, acceleratedMonths);
    
    // Initialize balances for each debt
    const debtBalances = new Map(debts.map(debt => [debt.id, debt.balance]));
    const acceleratedDebtBalances = new Map(debts.map(debt => [debt.id, debt.balance]));
    
    const totalInitialBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

    console.log('Timeline calculation setup:', {
      totalInitialBalance,
      totalMinimumPayment,
      baselineMonths,
      acceleratedMonths,
      maxMonths,
      debtsCount: debts.length
    });

    const data = Array.from({ length: maxMonths + 1 }, (_, index) => {
      const currentDate = addMonths(startDate, index);
      
      if (index === 0) {
        return {
          date: format(currentDate, 'yyyy-MM-dd'),
          baselineBalance: totalInitialBalance,
          acceleratedBalance: totalInitialBalance
        };
      }

      // Process baseline scenario (minimum payments only)
      let totalBaselineBalance = 0;
      let baselineFullyPaid = true;
      for (const debt of debts) {
        const currentBalance = debtBalances.get(debt.id)!;
        if (currentBalance > 0) {
          const monthlyInterest = (currentBalance * debt.interest_rate) / 1200;
          const minimumPayment = Math.min(currentBalance + monthlyInterest, debt.minimum_payment);
          const newBalance = Math.max(0, currentBalance + monthlyInterest - minimumPayment);
          debtBalances.set(debt.id, newBalance);
          totalBaselineBalance += newBalance;
          if (newBalance > 0) baselineFullyPaid = false;
        }
      }

      // Process accelerated scenario
      let totalAcceleratedBalance = 0;
      let acceleratedFullyPaid = true;
      let availablePayment = totalMinimumPayment;

      // Add one-time fundings for this month
      const fundingsForMonth = oneTimeFundings.filter(funding => {
        const fundingDate = new Date(funding.payment_date);
        return fundingDate.getMonth() === currentDate.getMonth() && 
               fundingDate.getFullYear() === currentDate.getFullYear();
      });
      
      const totalFundingAmount = fundingsForMonth.reduce((sum, funding) => sum + Number(funding.amount), 0);
      availablePayment += totalFundingAmount;

      // Process each debt with interest and payments
      for (const debt of debts) {
        const currentBalance = acceleratedDebtBalances.get(debt.id)!;
        if (currentBalance > 0) {
          const monthlyInterest = (currentBalance * debt.interest_rate) / 1200;
          const payment = Math.min(currentBalance + monthlyInterest, availablePayment);
          const newBalance = Math.max(0, currentBalance + monthlyInterest - payment);
          acceleratedDebtBalances.set(debt.id, newBalance);
          availablePayment -= payment;
          totalAcceleratedBalance += newBalance;
          if (newBalance > 0) acceleratedFullyPaid = false;
        }
      }

      console.log(`Month ${index} status:`, {
        date: format(currentDate, 'MMM yyyy'),
        baselineBalance: totalBaselineBalance.toFixed(2),
        acceleratedBalance: totalAcceleratedBalance.toFixed(2),
        baselineFullyPaid,
        acceleratedFullyPaid,
        remainingPayment: availablePayment.toFixed(2)
      });

      // Return the data point, ensuring both scenarios continue until their respective end dates
      return {
        date: format(currentDate, 'yyyy-MM-dd'),
        baselineBalance: index <= baselineMonths ? Math.round(totalBaselineBalance * 100) / 100 : null,
        acceleratedBalance: index <= acceleratedMonths ? Math.round(totalAcceleratedBalance * 100) / 100 : null
      };
    });

    return data;
  };

  const chartData = generateTimelineData();

  if (!chartData.length) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        No data available for timeline chart
      </div>
    );
  }

  // Find the accelerated payoff date
  const acceleratedPayoffDate = chartData.find(point => point.acceleratedBalance === 0)?.date;

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid 
            vertical={false} 
            horizontal={true} 
            stroke="#E2E8F0" 
            strokeDasharray="3 3"
          />
          <XAxis 
            dataKey="date"
            tick={{ fontSize: 12, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              try {
                if (!value) return '';
                return format(parseISO(value), 'MMM yyyy');
              } catch (error) {
                console.error('Error formatting date:', error);
                return '';
              }
            }}
            interval="preserveStartEnd"
            minTickGap={60}
          />
          <YAxis 
            tickFormatter={(value) => `${currencySymbol}${value.toLocaleString()}`}
            tick={{ fontSize: 12, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
            tickCount={6}
          />
          <Tooltip content={<TooltipComponent />} />
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="line"
            formatter={(value) => (
              <span style={{ color: '#64748B', fontSize: '14px' }}>
                {value}
              </span>
            )}
          />
          
          {oneTimeFundings.map((funding, index) => (
            <ReferenceLine
              key={index}
              x={format(new Date(funding.payment_date), 'yyyy-MM-dd')}
              stroke="#9333EA"
              strokeDasharray="3 3"
              label={{
                value: `${currencySymbol}${funding.amount}`,
                position: 'top',
                fill: '#9333EA',
                fontSize: 12
              }}
            />
          ))}

          {acceleratedPayoffDate && (
            <ReferenceLine
              x={acceleratedPayoffDate}
              stroke="#10B981"
              strokeWidth={2}
              label={{
                value: "Debt-Free!",
                position: 'top',
                fill: '#10B981',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
          )}
          
          <Line
            type="monotone"
            dataKey="baselineBalance"
            name="Original Timeline"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="acceleratedBalance"
            name="Accelerated Timeline"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
