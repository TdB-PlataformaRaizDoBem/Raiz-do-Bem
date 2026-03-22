interface StaticCardProps {
  icon: string;
  label: string;
  value: number | string;
  description: string;
}

export const StaticCard = ({
  icon,
  label,
  value,
  description,
}: StaticCardProps) => {
  return (
    <div
      className="
        bg-[#f4f4f4]
        p-4 sm:p-5 md:p-6
        rounded-2xl
        w-full
        shadow-sm
        transition
        hover:shadow-lightgreen/10 hover:shadow-2xl
        border border-gray-100
      "
    >
      <div className="flex items-center justify-between pb-4 sm:pb-5 md:pb-6">
        <img className="w-6 h-6 sm:w-7 sm:h-7" src={icon} alt={label} />
        <span className="text-xs sm:text-sm font-medium text-gray-500">
          {label}
        </span>
      </div>

      <strong className="text-2xl sm:text-3xl md:text-4xl font-bold text-black block">
        {value}
      </strong>

      <p className="text-xs sm:text-sm text-gray-400 mt-1">
        {description}
      </p>
    </div>
  );
};