import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Appearance } from "@/components/ui/profile/appearance";
import { ProfileEdit } from "@/components/ui/profile/profile-edit";
import { Separator } from "@/components/ui/separator";
import { ReactNode, memo } from "react";

interface SettingsDialogProps {
  trigger: ReactNode;
}

const SETTINGS_TITLE = "Settings";
const SETTINGS_DESCRIPTION =
  "Customize your Dirhamly experience. Adjust your profile and choose your preferred theme.";

export const SettingsDialog = memo(function SettingsDialog({
  trigger,
}: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-white/10 bg-background/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-left">
            {SETTINGS_TITLE}
          </DialogTitle>
          <DialogDescription className="text-left text-muted-foreground/80">
            {SETTINGS_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <ProfileEdit />
          <Separator className="bg-white/5" />
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Appearance</h4>
            <Appearance />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});