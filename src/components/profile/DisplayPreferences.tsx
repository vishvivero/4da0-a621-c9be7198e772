import { Bell, CreditCard, Settings, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencySelector } from "./CurrencySelector";
import { Badge } from "@/components/ui/badge";
import { countryCurrencies } from "@/lib/utils/currency-data";

interface DisplayPreferencesProps {
  preferredCurrency: string;
  onCurrencyChange: (currency: string) => void;
  onToggleChange: (key: string, value: boolean) => void;
  isUpdating: boolean;
}

export function DisplayPreferences({
  preferredCurrency,
  onCurrencyChange,
  onToggleChange,
  isUpdating
}: DisplayPreferencesProps) {
  // Handler to convert currency code to symbol before saving
  const handleCurrencyChange = (currencyCode: string) => {
    console.log('Currency code selected:', currencyCode);
    const currency = countryCurrencies.find(c => c.code === currencyCode);
    if (currency) {
      console.log('Converting currency code to symbol:', currency.symbol);
      onCurrencyChange(currency.symbol);
    }
  };

  // Convert stored symbol back to code for the selector
  const currentCurrencyCode = (() => {
    const currency = countryCurrencies.find(c => c.symbol === preferredCurrency);
    return currency?.code || 'GBP';
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Display Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <CurrencySelector
            value={currentCurrencyCode}
            onValueChange={handleCurrencyChange}
            disabled={isUpdating}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>Show Notifications</span>
              </div>
              <Switch 
                defaultChecked 
                onCheckedChange={(checked) => onToggleChange('notifications', checked)}
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span>Show Payment Balance</span>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </div>
              </div>
              <Switch 
                disabled={true}
                checked={false}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span>Show Debt Balance</span>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </div>
              </div>
              <Switch 
                disabled={true}
                checked={false}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}