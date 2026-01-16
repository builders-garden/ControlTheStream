import { Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction } from "react";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { Switch } from "@/components/shadcn-ui/switch";
import { Guest } from "@/lib/types/poll.type";
import { cn } from "@/lib/utils";
import { FormAmountInput } from "./form-amount-input";
import { FormTextInput } from "./form-text-input";

interface GuestPayoutProps {
  isActive: boolean;
  setIsActive: Dispatch<SetStateAction<boolean>>;
  label: string;
  guests: Guest[];
  setGuests: Dispatch<SetStateAction<Guest[]>>;
  disabled?: boolean;
}

export const GuestPayout = ({
  label,
  guests,
  setGuests,
  isActive,
  setIsActive,
  disabled,
}: GuestPayoutProps) => {
  // Guest number
  const isGuestCountAtLimit = guests.length >= 2;

  // Handles the addition of a new guest
  const handleAddGuest = () => {
    if (isGuestCountAtLimit) {
      return;
    }
    const numberOfGuests = guests.length + 1;
    const equalSplit = (100 / numberOfGuests).toFixed(2);
    setGuests([
      ...guests.map((guest) => ({
        ...guest,
        splitPercent: equalSplit,
      })),
      { owner: false, nameOrAddress: "", splitPercent: equalSplit },
    ]);
  };

  // Handles the removal of a guest
  const handleRemoveGuest = (index: number) => {
    setGuests([...guests.slice(0, index), ...guests.slice(index + 1)]);
  };

  // Handles the updating of a guest
  const handleUpdateGuest = (index: number, guest: Guest) => {
    setGuests([...guests.slice(0, index), guest, ...guests.slice(index + 1)]);
  };

  // Handles the update of a guest's split percent
  const handleUpdateGuestSplitPercent = (
    guestIndex: number,
    newValue: string,
  ) => {
    let newSplitPercent = newValue;

    // Calculate the sum of all guests percentages
    const sumOfAllOtherGuests = guests.reduce(
      (acc, guest, index) =>
        index === guestIndex ? acc : acc + parseFloat(guest.splitPercent),
      0,
    );
    if (sumOfAllOtherGuests + parseFloat(newValue) > 100) {
      newSplitPercent = (100 - sumOfAllOtherGuests).toFixed(2);
    }
    const newGuest = {
      ...guests[guestIndex],
      splitPercent: newSplitPercent,
    };
    handleUpdateGuest(guestIndex, newGuest);
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-start items-start gap-2.5 w-full h-full transition-all duration-300",
        disabled && "opacity-50",
      )}>
      {/* Label */}
      <div className="flex justify-between items-center gap-2.5 w-full">
        <div className="flex justify-start items-center gap-2.5 w-full">
          <div className="flex flex-col justify-start items-start">
            <p className="text-base font-bold text-muted-foreground">{label}</p>
            <p className="text-xs opacity-50 font-bold text-muted">
              Split vote earnings with guests.
            </p>
          </div>
          <Switch
            disabled={disabled}
            checked={isActive}
            onCheckedChange={setIsActive}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted h-[25px] w-[44px] cursor-pointer"
            toggleClassName="size-[21px] data-[state=checked]:bg-background data-[state=unchecked]:bg-foreground data-[state=checked]:translate-x-[calc(100%-1px)]"
          />
        </div>
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}>
              <CTSButton
                onClick={handleAddGuest}
                disabled={isGuestCountAtLimit || disabled}
                className="bg-primary/15 hover:bg-primary/20">
                <p className="text-sm font-extrabold text-primary">Add guest</p>
              </CTSButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col justify-start items-start gap-2.5">
            <div className="flex justify-between items-center gap-2.5 mr-[34px]">
              <div className="flex w-[250px] shrink-0 justify-start items-center gap-2.5 rounded-[12px] border-muted border-[1px] ring-muted-foreground/40 px-5 py-2.5 transition-all duration-300">
                <p className="text-sm font-medium truncate">
                  (You){" "}
                  <span className="font-bold h-[21px]">
                    {guests[0].nameOrAddress}
                  </span>
                </p>
              </div>

              <FormAmountInput
                className="w-full"
                placeholder="Guest Split Percent"
                step="0.01"
                disabled={disabled}
                value={guests[0].splitPercent}
                setValue={(newValue: string) => {
                  handleUpdateGuestSplitPercent(0, newValue);
                }}
              />
            </div>
            {guests.slice(1).map((guest, index) => {
              const actualIndex = index + 1; // Adjust index for original array
              return (
                <div
                  key={actualIndex}
                  className="flex justify-between items-center gap-2.5">
                  <FormTextInput
                    placeholder="Guest Base Name or Address"
                    className="w-[250px] shrink-0"
                    disabled={disabled}
                    value={guest.nameOrAddress}
                    setValue={(newValue: string) => {
                      const newGuest = {
                        ...guest,
                        nameOrAddress: newValue,
                      };
                      handleUpdateGuest(actualIndex, newGuest);
                    }}
                  />
                  <FormAmountInput
                    className="w-full"
                    placeholder="Guest Split Percent"
                    disabled={disabled}
                    value={guest.splitPercent}
                    setValue={(newValue: string) =>
                      handleUpdateGuestSplitPercent(actualIndex, newValue)
                    }
                  />
                  <motion.button
                    whileHover={{ scale: disabled ? 1 : 1.05 }}
                    whileTap={{ scale: disabled ? 1 : 0.95 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    disabled={disabled}
                    onClick={() => {
                      handleRemoveGuest(actualIndex);
                    }}
                    className={cn(
                      "cursor-pointer shrink-0",
                      disabled && "cursor-default",
                    )}>
                    <Trash className="size-6 text-destructive" />
                  </motion.button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
