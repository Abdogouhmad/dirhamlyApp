import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";

type Theme = "light" | "dark" | "system";

interface AppearanceProps {
  // initialTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export function Appearance({ onThemeChange }: AppearanceProps) {
  const { theme, setTheme } = useTheme();

  const selected = theme as Theme;

  const handleChange = useCallback(
    (value: Theme) => {
      setTheme(value);
      onThemeChange?.(value);
    },
    [setTheme, onThemeChange],
  );

  const themeOptions = useMemo(
    () => THEME_OPTIONS.map(({ value, label }) => ({ value, label })),
    [],
  );

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Theme Appearance</h2>
      <RadioGroup
        value={selected}
        onValueChange={handleChange}
        className="flex flex-row space-x-4"
      >
        {themeOptions.map(({ value, label }) => (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroupItem value={value} id={value} />
            <Label htmlFor={value}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
