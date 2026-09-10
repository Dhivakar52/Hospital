import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as ShadLabel } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <ShadLabel className="mb-1.5 block text-[12.5px] font-medium text-muted-foreground">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </ShadLabel>
  );
}

export function Field({
  label,
  required,
  children,
  span = 1,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div style={{ gridColumn: `span ${span} / span ${span}` }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}

// ✅ Controlled TextField - accepts value/onChange so it can be wired into filter state
export function TextField({
  placeholder,
  disabled,
  value,
  defaultValue,
  onChange,
}: {
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Input
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-9 text-[13px] rounded-[4px]"
    />
  );
}

// ✅ Controlled / Uncontrolled SelectField with safe fallback
export function SelectField({
  options,
  placeholder = "Select",
  value,
  defaultValue,
  onChange,
}: {
  options: readonly string[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [internalVal, setInternalVal] = React.useState<string>(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentVal = isControlled ? (value ?? "") : internalVal;

  const handleChange = (newVal: string) => {
    if (!isControlled) {
      setInternalVal(newVal);
    }
    onChange?.(newVal);
  };

  // Ensure current value is included in options so it displays properly even if custom
  const allOptions = React.useMemo(() => {
    if (currentVal && !options.includes(currentVal)) {
      return [currentVal, ...options];
    }
    return options;
  }, [options, currentVal]);

  return (
    <NativeSelect
      value={currentVal}
      onChange={(e) => handleChange(e.target.value)}
      className="h-9 text-[13px] w-full"
    >
      <option value="">{placeholder}</option>
      {allOptions.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </NativeSelect>
  );
}

// ✅ Controlled DateField - accepts value/onChange so it can be wired into filter state
export function DateField({
  placeholder = "Pick a date",
  defaultLabel,
  value,
  onChange,
  disabled,
  disabledDays,
  minDate,
  maxDate,
}: {
  placeholder?: string;
  defaultLabel?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  disabledDays?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
}) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>();
  const date = value !== undefined ? value : internalDate;

  const handleSelect = (d: Date | undefined) => {
    if (onChange) {
      onChange(d);
    } else {
      setInternalDate(d);
    }
  };

  const isDateDisabled = (d: Date) => {
    if (disabled) return true;
    if (disabledDays && disabledDays(d)) return true;
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (d < min) return true;
    }
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(23, 59, 59, 999);
      if (d > max) return true;
    }
    return false;
  };

  return (
    <Popover>
      <PopoverTrigger className="w-full" disabled={disabled}>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start px-3 text-left text-[13px] font-normal text-slate-700 rounded-[4px]",
            !date && !defaultLabel && "text-slate-400"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
          {date ? format(date, "dd-MM-yyyy") : defaultLabel ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleSelect} disabled={isDateDisabled} />
      </PopoverContent>
    </Popover>
  );
}

// ✅ Controlled DobDateField - Month & Year dropdown caption layout for Date of Birth selection
export function DobDateField({
  placeholder = "Select Date of Birth",
  value,
  onChange,
  disabled,
}: {
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
}) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>();
  const date = value !== undefined ? value : internalDate;
  const currentYear = new Date().getFullYear();

  const handleSelect = (d: Date | undefined) => {
    if (onChange) {
      onChange(d);
    } else {
      setInternalDate(d);
    }
  };

  return (
    <Popover>
      <PopoverTrigger disabled={disabled} className="w-full">
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start px-3 text-left text-[13px] font-normal text-slate-700 rounded-[4px]",
            !date && "text-slate-400"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
          {date ? format(date, "dd-MM-yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          captionLayout="dropdown"
          startMonth={new Date(1920, 0)}
          endMonth={new Date(currentYear, 11)}
          disabled={(d) => d > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}