import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface AppearanceProps {
  initialTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

export function Appearance({ initialTheme = "system", onThemeChange }: AppearanceProps) {
  const { theme, setTheme } = useTheme();
  const [selected, setSelected] = useState<Theme>(initialTheme);

  // Sync local state with next-themes on mount
  useEffect(() => {
    if (theme === "system") {
      setSelected("system");
    } else {
      setSelected(theme as Theme);
    }
  }, [theme]);

  const handleChange = (value: Theme) => {
    setSelected(value);

    if (value === "system") {
      setTheme("system"); // fallback to OS theme
    } else {
      setTheme(value); // force light/dark
    }

    onThemeChange?.(value);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Theme Appearance</h2>
      <RadioGroup value={selected} onValueChange={handleChange} className="flex flex-row space-x-4">
        <div className="flex items-center space-x-2 mb-1">
          <RadioGroupItem value="light" id="light" />
          <Label htmlFor="light">Light</Label>
        </div>
        <div className="flex items-center space-x-2 mb-1">
          <RadioGroupItem value="dark" id="dark" />
          <Label htmlFor="dark">Dark</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="system" id="system" />
          <Label htmlFor="system">System</Label>
        </div>
      </RadioGroup>
    </div>
  );
}