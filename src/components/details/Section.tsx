import { type ReactNode } from "react";

export type SectionItem = {
  label: string;
  value: ReactNode;
  valueClass?: string;
};

type SectionVariant = "default" | "muted" | "accent" | "dashed";

const CARD_CLASS: Record<SectionVariant, string> = {
  default: "bg-white p-5 rounded-2xl border border-gray-100 shadow-sm",
  muted:   "bg-gray-50/50 p-5 rounded-2xl border border-gray-100",
  accent:  "bg-amber/5 p-5 rounded-2xl border border-amber/10",
  dashed:  "bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-300",
};

const TITLE_CLASS: Record<SectionVariant, string> = {
  default: "text-xs font-black uppercase text-gray-400 tracking-wider mb-3",
  muted:   "text-xs font-black uppercase text-gray-400 tracking-wider mb-3",
  accent:  "text-xs font-black uppercase text-amber tracking-wider mb-3",
  dashed:  "text-xs font-black uppercase text-gray-500 tracking-wider mb-3",
};

function FieldItem({
  label,
  value,
  valueClass,
  divider,
}: {
  label: string;
  value: ReactNode;
  valueClass?: string;
  divider: boolean;
}) {
  return (
    <div className={divider ? "pt-3 border-t border-gray-100" : undefined}>
      <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">{label}</p>
      {typeof value === "string" || typeof value === "number" ? (
        <p className={`text-darkgray font-medium${valueClass ? ` ${valueClass}` : ""}`}>{value}</p>
      ) : (
        <>{value}</>
      )}
    </div>
  );
}

type SectionProps = {
  title?: string;
  items?: SectionItem[];
  children?: ReactNode;
  variant?: SectionVariant;
  layout?: "stack" | "grid";
  className?: string;
};

export function Section({
  title,
  items,
  children,
  variant = "default",
  layout = "stack",
  className,
}: SectionProps) {
  const cardClass = CARD_CLASS[variant] + (className ? ` ${className}` : "");
  return (
    <div className={cardClass}>
      {title && <p className={TITLE_CLASS[variant]}>{title}</p>}
      {items ? (
        layout === "grid" ? (
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
              <FieldItem
                key={item.label}
                label={item.label}
                value={item.value}
                valueClass={item.valueClass}
                divider={false}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <FieldItem
                key={item.label}
                label={item.label}
                value={item.value}
                valueClass={item.valueClass}
                divider={i > 0}
              />
            ))}
          </div>
        )
      ) : (
        children
      )}
    </div>
  );
}

export function ColLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-black uppercase text-gray-400 tracking-wider">{children}</p>
  );
}
