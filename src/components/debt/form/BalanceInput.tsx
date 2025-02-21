
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";

interface BalanceInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const BalanceInput = ({ value, onChange, disabled }: BalanceInputProps) => {
  return (
    <div className="relative space-y-2">
      <Label className="text-sm font-medium text-gray-700">Outstanding Debt Balance</Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Wallet className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 bg-white hover:border-primary/50 transition-colors"
          placeholder="10000"
          required
          min="0"
          step="0.01"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
