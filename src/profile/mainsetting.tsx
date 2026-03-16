import {  Dialog,

  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger} from "@/components/ui/dialog";
import { TypographyP } from "@/components/ui/text";
import { Appearance } from "@/profile/appearnce";
import { ReactNode } from "react";
interface SettingsDialogProps {
  trigger: ReactNode;
}
export function SettingsDialog({ trigger }: SettingsDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">Dirhamly Settings</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <TypographyP text="Customize your Dirhamly experience by adjusting the settings below. Choose your preferred theme and make Dirhamly truly yours!" />
                </DialogDescription>
                <Appearance />
            </DialogContent>
        </Dialog>
    );
}