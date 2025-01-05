import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface OneTimeFundingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OneTimeFundingDialog = ({ isOpen, onClose }: OneTimeFundingDialogProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount || !user) return;

    setIsSubmitting(true);
    console.log('Submitting one-time funding:', { amount, date, notes });

    try {
      const { error } = await supabase
        .from('one_time_funding')
        .insert([{
          user_id: user.id,
          amount: Number(amount),
          payment_date: date.toISOString(),
          notes: notes || null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "One-time funding has been added successfully",
      });
      onClose();
      setAmount("");
      setDate(new Date());
      setNotes("");
    } catch (error) {
      console.error('Error adding one-time funding:', error);
      toast({
        title: "Error",
        description: "Failed to add one-time funding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add One-time Funding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Expected Payment Date</Label>
            <Input
              id="date"
              type="date"
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add any notes about this funding"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !date || !amount}
          >
            {isSubmitting ? "Adding..." : "Add Funding"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};