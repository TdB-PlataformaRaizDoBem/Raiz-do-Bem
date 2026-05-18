import type { EspecialidadeAPI } from "../../domain/entities/EspecialidadeAPI";

interface SelectEspecialidadeProps {
  value?: number | "";
  onChange: (id: number) => void;
  onBlur?: () => void;
  especialidades: EspecialidadeAPI[];
  loading: boolean;
  error?: string | null;
  fetchError?: string | null;
  className?: string;
  required?: boolean;
  label?: string;
  name?: string;
}

export const SelectEspecialidade = ({
  value,
  onChange,
  onBlur,
  especialidades,
  loading,
  error,
  fetchError,
  className = "",
  required = true,
  label = "Especialidade",
  name = "idEspecialidade",
}: SelectEspecialidadeProps) => {
  const baseClass =
    "p-3 border rounded-md w-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all";
  const errorClass = error ? "border-red-600" : "border-gray-200";

  return (
    <div className="flex flex-col mb-4 w-full">
      <label
        htmlFor={name}
        className="block mb-1 font-medium text-black"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {fetchError ? (
        <div className="p-3 border border-red-300 rounded-md bg-red-50 text-red-600 text-sm">
          Erro ao carregar especialidades: {fetchError}
        </div>
      ) : (
        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={onBlur}
          disabled={loading}
          className={`${baseClass} ${errorClass} ${className} ${
            loading ? "cursor-wait opacity-70" : ""
          }`}
        >
          <option value="" disabled>
            {loading ? "Carregando especialidades..." : "Selecione uma especialidade"}
          </option>

          {!loading &&
            especialidades.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.descricao}
              </option>
            ))}
        </select>
      )}

      {error && (
        <p className="text-[10px] font-bold mt-1 text-red-500">{error}</p>
      )}
    </div>
  );
};
