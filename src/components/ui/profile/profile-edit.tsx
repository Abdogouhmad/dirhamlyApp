"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/lib/ProfileContext";
import { useRefresh } from "@/lib/Refreshcontext";
import { getConversionRate } from "@/lib/currency";
import { invoke } from "@tauri-apps/api/core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUPPORTED_CURRENCIES = [
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CAD", name: "Canadian Dollar" },
];

export function ProfileEdit() {
  const { profile, setProfile } = useProfile();
  const { refresh } = useRefresh();
  const [name, setName] = useState(profile?.name || "");
  const [image, setImage] = useState<string | null>(profile?.image || null);
  const [currency, setSelectedCurrency] = useState(profile?.currency || "MAD");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setImage(profile.image);
      setSelectedCurrency(profile.currency);
    }
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const oldCurrency = profile?.currency || "MAD";
      const currencyChanged = oldCurrency !== currency;

      await setProfile({ name, image, currency });

      if (currencyChanged) {
        const rate = getConversionRate(oldCurrency, currency);
        await invoke("convert_all_tx", { rate });
        toast.success(`Currency rebased to ${currency}`, {
          description: `All transactions were converted using a rate of ${rate.toFixed(4)}`,
        });
      } else {
        toast.success("Profile updated!");
      }
      
      // Refresh dashboard to show new numbers/labels
      await refresh();
    } catch (err: any) {
      toast.error("Failed to update profile", { description: err.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar className="h-20 w-24 border-2 border-cobalt-500/30 shadow-xl">
            <AvatarImage src={image || ""} />
            <AvatarFallback className="bg-cobalt-500/10 text-cobalt-400 text-xl font-bold">
              {name.slice(0, 2).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <label 
            htmlFor="profile-avatar-upload" 
            className="absolute bottom-0 right-0 p-1.5 bg-cobalt-500 rounded-full cursor-pointer shadow-lg hover:bg-cobalt-600 transition-colors"
          >
            <Camera className="h-3 w-3 text-white" />
            <input id="profile-avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Display Name</Label>
          <Input 
            id="profile-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="font-semibold"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Primary Currency</Label>
          <Select value={currency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="font-semibold h-11 rounded-xl bg-white/[0.03] border-white/5 backdrop-blur-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/10 bg-background/95 backdrop-blur-3xl">
              {SUPPORTED_CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code} className="h-11 rounded-xl">
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-xs bg-white/5 px-2 py-0.5 rounded text-cobalt-400">{c.code}</span>
                    <span className="font-medium text-sm">{c.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full h-11 font-semibold rounded-xl" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
