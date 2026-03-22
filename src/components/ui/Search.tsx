import { type InputHTMLAttributes } from "react";
import SearchIcon from "../../assets/svgs/search.svg";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
}

const Search = ({ placeholder , ...props} : InputProps) => {
  return (
      <div className="relative">
        <img
          src={SearchIcon}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 opacity-50"
          alt=""
        />
        <input
          {...props}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange transition-all"
          placeholder={placeholder}
        />
      </div>
  );
};

export default Search;
