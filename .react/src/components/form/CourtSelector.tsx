import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COURT_CATEGORIES } from "@/constants/courts";

interface CourtSelectorProps {
  selectedCourts: string[];
  onSelect: (court: string) => void;
  placeholder?: string;
}

export function CourtSelector({
  selectedCourts,
  onSelect,
  placeholder = "Search and select a court...",
}: CourtSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 px-4 text-left font-normal"
        >
          <span className="truncate text-muted-foreground">
            {placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Type court name..." 
            data-prevent-navigation="true"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No court found.</CommandEmpty>
            <div className="max-h-64 overflow-y-auto">
              {selectedCourts.length > 0 && (
                <>
                  <CommandGroup heading="Selected">
                    {selectedCourts.map((court) => (
                      <CommandItem
                        key={`selected-${court}`}
                        value={court}
                        onSelect={() => {
                          onSelect(court);
                          setSearch(""); 
                        }}
                        className="cursor-pointer bg-primary/5"
                      >
                        <Check className="mr-2 h-4 w-4 opacity-100" />
                        {court}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}
              {COURT_CATEGORIES.map((category) => (
                <CommandGroup key={category.label} heading={category.label}>
                  {category.courts.map((court) => (
                    <CommandItem
                      key={court}
                      value={court}
                      onSelect={() => {
                        onSelect(court);
                        setSearch(""); // Clear search after selection
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCourts.includes(court) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {court}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
