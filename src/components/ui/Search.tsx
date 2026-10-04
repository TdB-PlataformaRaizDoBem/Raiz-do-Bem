import { type InputHTMLAttributes } from "react";
import SearchIcon from "../../assets/svgs/search.svg";
import { useVoiceSearch } from "../../hooks/useVoiceSearch";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
}

const Search = ({ placeholder, onChange, ...props }: InputProps) => {
  const { listening, toggle, isSupported } = useVoiceSearch((transcript) => {
    onChange?.({ target: { value: transcript } } as React.ChangeEvent<HTMLInputElement>);
  });

  return (
    <div className="relative">
      <img
        src={SearchIcon}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 opacity-50"
        alt=""
        aria-hidden="true"
      />
      <input
        {...props}
        onChange={onChange}
        className={`w-full h-10 pl-10 ${isSupported ? "pr-10" : "pr-4"} border border-gray-200 rounded-lg text-sm outline-none focus:border-orange focus-visible:ring-2 focus-visible:ring-orange/30 transition-all`}
        placeholder={listening ? "Ouvindo..." : placeholder}
        aria-label={placeholder}
      />
      {isSupported && (
        <button
          type="button"
          onClick={toggle}
          aria-label={listening ? "Parar reconhecimento de voz" : "Pesquisar por voz"}
          aria-pressed={listening}
          title={listening ? "Parar" : "Pesquisar por voz"}
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 rounded ${
            listening ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-darkgreen"
          }`}
        >
          {listening ? (
            /* Microfone ativo */
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4zm-1 17.93V21h2v-2.07A8 8 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93z"/>
            </svg>
          ) : (
            /* Microfone inativo */
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default Search;
