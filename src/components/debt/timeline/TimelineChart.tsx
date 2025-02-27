
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { OneTimeFunding } from "@/hooks/use-one-time-funding";
import { format, parseISO } from "date-fns";
import { TimelineTooltip } from "./TimelineTooltip";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimelineChartProps {
  data: any[];
  debts: any[];
  formattedFundings: OneTimeFunding[];
}

export const TimelineChart = ({ data, debts, formattedFundings }: TimelineChartProps) => {
  const [debugMode, setDebugMode] = useState(false);
  const [showData, setShowData] = useState(false);
  
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    console.log(`[DEBUG] Debug mode ${!debugMode ? 'enabled' : 'disabled'}`);
    if (!debugMode) {
      // Log timeline data points when debug mode is enabled
      console.log('[DEBUG] Timeline data points:', data);
      console.log('[DEBUG] Formatted fundings:', formattedFundings);
    }
  };
  
  // Find data points that have one-time payments
  const oneTimePaymentMonths = data.filter(d => d.oneTimePayment).map(d => d.monthLabel);
  
  // Helper to highlight one-time funding dates
  const isOneTimeFundingMonth = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return formattedFundings.some(funding => {
        const fundingDate = new Date(String(funding.payment_date));
        return fundingDate.getMonth() === date.getMonth() && 
               fundingDate.getFullYear() === date.getFullYear();
      });
    } catch (error) {
      console.error('Error checking funding date:', error);
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          {oneTimePaymentMonths.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">One-time payments in: </span>
              {oneTimePaymentMonths.map((month, i) => (
                <Badge key={i} variant="outline" className="ml-1 bg-purple-100 text-purple-800">
                  {month}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleDebugMode}
            className={debugMode ? "bg-amber-100" : ""}
          >
            {debugMode ? "Disable Debug" : "Enable Debug"}
          </Button>
          
          {debugMode && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowData(!showData)}
            >
              {showData ? "Hide Data" : "Show Data"}
            </Button>
          )}
        </div>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="acceleratedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#34D399" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} horizontal={true} stroke="#e5e7eb" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={{ stroke: '#9CA3AF' }}
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
              minTickGap={30}
              // Highlight one-time funding months
              label={(props) => {
                const { x, y, width, height } = props;
                return isOneTimeFundingMonth(props.value) && debugMode ? (
                  <text x={x} y={y + height + 10} textAnchor="middle" fill="#9333EA" fontSize={10}>
                    ↑ Funding
                  </text>
                ) : null;
              }}
            />
            <YAxis 
              tickFormatter={(value) => `${debts[0].currency_symbol}${value.toLocaleString()}`}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={{ stroke: '#9CA3AF' }}
            />
            <Tooltip content={<TimelineTooltip />} />
            <Legend />
            
            {/* Render reference lines for one-time funding payments */}
            {formattedFundings.map((funding, index) => {
              const fundingDate = typeof funding.payment_date === 'string' 
                ? funding.payment_date 
                : String(funding.payment_date);
              
              // Enhance the visibility of reference lines in debug mode
              const strokeStyle = debugMode ? 
                { stroke: "#9333EA", strokeWidth: 3, strokeDasharray: "5 2" } :
                { stroke: "#9333EA", strokeWidth: 2, strokeDasharray: "5 5" };
                
              return (
                <ReferenceLine
                  key={index}
                  x={fundingDate}
                  {...strokeStyle}
                  label={{
                    value: `${debts[0].currency_symbol}${funding.amount.toLocaleString()}`,
                    position: 'top',
                    fill: '#9333EA',
                    fontSize: 12,
                    fontWeight: 'bold',
                    offset: 10
                  }}
                />
              );
            })}
            
            <Area
              type="monotone"
              dataKey="baselineBalance"
              name="Original Timeline"
              stroke="#94A3B8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#baselineGradient)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="acceleratedBalance"
              name="Accelerated Timeline"
              stroke="#34D399"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#acceleratedGradient)"
              dot={(props) => {
                // Check if this data point corresponds to a funding date
                if (!props || !props.payload) return null;
                
                const dataDate = props.payload.date;
                // Check if this is a funding date
                const isFundingMonth = isOneTimeFundingMonth(dataDate);
                
                if (isFundingMonth) {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={debugMode ? 7 : 5}
                      fill="#9333EA"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              }}
              activeDot={{ r: 6, fill: "#34D399", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Debug Data Inspector */}
      {debugMode && showData && (
        <Tabs defaultValue="data">
          <TabsList>
            <TabsTrigger value="data">Timeline Data</TabsTrigger>
            <TabsTrigger value="fundings">One-Time Fundings</TabsTrigger>
          </TabsList>
          <TabsContent value="data" className="max-h-[300px] overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Timeline Data Points</CardTitle>
                <CardDescription>
                  Total Points: {data.length} | 
                  With One-Time Payments: {data.filter(d => d.oneTimePayment).length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Month</th>
                      <th className="py-2 text-left">Date</th>
                      <th className="py-2 text-right">Baseline</th>
                      <th className="py-2 text-right">Accelerated</th>
                      <th className="py-2 text-right">One-Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((point, i) => (
                      <tr key={i} className={`border-b ${point.oneTimePayment ? "bg-purple-50" : ""}`}>
                        <td className="py-1">{point.monthLabel}</td>
                        <td className="py-1 text-xs">{new Date(point.date).toISOString().split('T')[0]}</td>
                        <td className="py-1 text-right">{point.baselineBalance.toLocaleString()}</td>
                        <td className="py-1 text-right">{point.acceleratedBalance.toLocaleString()}</td>
                        <td className={`py-1 text-right ${point.oneTimePayment ? "text-purple-700 font-medium" : ""}`}>
                          {point.oneTimePayment ? point.oneTimePayment.toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fundings">
            <Card>
              <CardHeader>
                <CardTitle>One-Time Fundings</CardTitle>
                <CardDescription>Total: {formattedFundings.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Date</th>
                      <th className="py-2 text-right">Amount</th>
                      <th className="py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedFundings.map((funding, i) => {
                      const fundingDate = typeof funding.payment_date === 'string'
                        ? funding.payment_date
                        : String(funding.payment_date);
                        
                      return (
                        <tr key={i} className="border-b">
                          <td className="py-1">{new Date(fundingDate).toLocaleDateString()}</td>
                          <td className="py-1 text-right">{Number(funding.amount).toLocaleString()}</td>
                          <td className="py-1">{funding.notes || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
