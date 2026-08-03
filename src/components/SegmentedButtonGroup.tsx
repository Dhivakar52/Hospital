import React from "react";

export interface SegmentedButtonItem {
  id: string;
  label: string;
  /**
   * Optional icon component (e.g. Lucide icon component) or pre-rendered React node
   */
  icon?: React.ElementType | React.ReactNode;
}

export interface SegmentedButtonGroupProps {
  items: SegmentedButtonItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const SegmentedButtonGroup: React.FC<SegmentedButtonGroupProps> = ({
  items,
  activeId,
  onChange,
  className = "",
}) => {
  return (
    <div
      role="tablist"
      aria-label="Segmented options"
      className={`inline-flex flex-wrap sm:flex-nowrap items-center gap-[8px] p-[8px] bg-[#F5F7FA] rounded-[30px] border border-slate-100/60 shadow-2xs max-w-full ${className}`}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;

        // Helper to render icon cleanly whether passed as a component or node
        const renderIcon = () => {
          if (!item.icon) return null;
          if (typeof item.icon === "function" || (typeof item.icon === "object" && item.icon !== null && "render" in item.icon)) {
            const IconComp = item.icon as React.ElementType;
            return <IconComp className="w-[18px] h-[18px] shrink-0" />;
          }
          if (React.isValidElement(item.icon)) {
            return item.icon;
          }
          return null;
        };

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={`
              inline-flex items-center justify-center gap-[8px] h-[44px] px-[20px] py-[10px]
              rounded-[10px] text-[14px] font-medium font-sans leading-none
              cursor-pointer select-none whitespace-nowrap outline-none
              transition-all duration-200 ease-in-out
              focus-visible:ring-2 focus-visible:ring-[#3B5BDB] focus-visible:ring-offset-2
              ${
                isActive
                  ? "bg-[#3B5BDB] text-white border border-transparent hover:bg-[#2F4FC4] shadow-[0_2px_8px_rgba(59,91,219,0.22)]"
                  : "bg-white text-[#2563EB] border border-[#D6E4FF] hover:bg-[#EFF6FF] hover:border-[#BFD5FF] shadow-2xs"
              }
            `}
          >
            {renderIcon()}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedButtonGroup;
