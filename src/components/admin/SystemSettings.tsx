import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";

export const SystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [siteTitle, setSiteTitle] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("£");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      console.log("Fetching system settings...");
      const { data, error } = await supabase
        .from("system_settings")
        .select("*");

      if (error) {
        console.error("Error fetching system settings:", error);
        throw error;
      }

      console.log("Fetched system settings:", data);
      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (settings: any) => {
      console.log("Updating system settings:", settings);
      const { error } = await supabase
        .from("system_settings")
        .upsert([
          {
            key: "site_settings",
            value: {
              maintenanceMode,
              siteTitle,
              defaultCurrency,
            },
          },
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast({
        title: "Success",
        description: "System settings updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating system settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update system settings",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance">Maintenance Mode</Label>
            <Switch
              id="maintenance"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteTitle">Site Title</Label>
            <Input
              id="siteTitle"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Enter site title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Input
              id="currency"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              placeholder="Enter default currency symbol"
            />
          </div>
        </div>

        <Button
          onClick={() => updateSettings.mutate()}
          disabled={updateSettings.isPending}
          className="w-full"
        >
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};