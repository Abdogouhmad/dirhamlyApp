import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TypographyP } from "@/components/ui/text";
import { Appearance } from "@/components/ui/profile/appearance";
import { ReactNode, memo } from "react";

interface SettingsDialogProps {
  trigger: ReactNode;
}

const SETTINGS_TITLE = "Dirhamly Settings";
const SETTINGS_DESCRIPTION =
  "Customize your Dirhamly experience by adjusting the settings below. Choose your preferred theme and make Dirhamly truly yours!";

export const SettingsDialog = memo(function SettingsDialog({
  trigger,
}: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
            {SETTINGS_TITLE}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <TypographyP text={SETTINGS_DESCRIPTION} />
        </DialogDescription>
        <Appearance />
      </DialogContent>
    </Dialog>
  );
});