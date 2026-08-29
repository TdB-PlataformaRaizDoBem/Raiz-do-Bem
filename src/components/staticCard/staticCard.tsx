import { memo } from "react";

type StaticCardColor = "green" | "orange" | "amber" | "lightgreen";

const colorStyles: Record<
  StaticCardColor,
  { border: string; value: string; icon: string }
> = {
  green:      { border: "border-t-4 border-darkgreen",   value: "text-darkgreen",  icon: "bg-darkgreen/10" },
  orange:     { border: "border-t-4 border-orange",      value: "text-orange",     icon: "bg-orange/10" },
  amber:      { border: "border-t-4 border-amber",       value: "text-amber",      icon: "bg-amber/10" },
  lightgreen: { border: "border-t-4 border-lightgreen",  value: "text-darkgreen",  icon: "bg-lightgreen/10" },
};

interface StaticCardProps {
  icon: string;
  label: string;
  value: number | string;
  description: string;
  color?: StaticCardColor;
}

export const StaticCard = memo(function StaticCard({
  icon,
  label,
  value,
  description,
  color,
}: StaticCardProps) {
  const styles = color ? colorStyles[color] : null;

  return (
    <div
      className={`
        bg-white p-5 sm:p-6 rounded-2xl w-full shadow-sm border border-gray-100
        transition hover:shadow-md
        ${styles?.border ?? "border-t-4 border-transparent"}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${styles?.icon ?? "bg-gray-100"}`}>
          <img className="w-5 h-5" src={icon} alt="" aria-hidden="true" />
        </div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right max-w-[120px] leading-tight">
          {label}
        </span>
      </div>

      <strong className={`text-3xl sm:text-4xl font-bold block leading-none ${styles?.value ?? "text-black"}`}>
        {value}
      </strong>

      <p className="text-xs text-gray-400 mt-2 font-medium">{description}</p>
    </div>
  );
});
