import { useState } from "react";
import { useDentistas } from "../../hooks/useDentistas";

type SelectDentistaProps = {
  value: string;
  onChange: (id: string) => void;
};

export const SelectDentista = ({ value, onChange }: SelectDentistaProps) => {
  const { data: dentistas, loading, error } = useDentistas();
  const [busca, setBusca] = useState("");

  const coordenadores = (dentistas ?? []).filter(
    (d) => d.categoria === "COORDENADOR",
  );

  const filtrados = busca.trim()
    ? coordenadores.filter((d) =>
        d.nomeCompleto.toLowerCase().includes(busca.trim().toLowerCase()),
      )
    : coordenadores;

  if (error) {
    return (
      <p className="text-xs text-red-500 mt-1">
        Erro ao carregar dentistas. Recarregue a página.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-black uppercase text-gray-400">
        Dentista responsável
      </label>

      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Filtrar por nome..."
        disabled={loading}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lightgreen/50 focus:border-lightgreen transition disabled:opacity-50"
      />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || filtrados.length === 0}
        className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lightgreen/50 focus:border-lightgreen transition ${
          loading ? "opacity-50 cursor-wait" : ""
        }`}
      >
        <option value="" disabled>
          {loading
            ? "Carregando dentistas..."
            : filtrados.length === 0
              ? "Nenhum dentista encontrado"
              : "Selecione um dentista"}
        </option>

        {!loading &&
          filtrados.map((d) => {
            const especialidade = d.especialidades.length
              ? ` — ${d.especialidades.slice(0, 2).join(", ")}`
              : "";
            const disponibilidade = d.disponivel ? "" : " (indisponível)";
            return (
              <option key={d.id} value={String(d.id)}>
                {d.nomeCompleto}
                {especialidade}
                {disponibilidade}
              </option>
            );
          })}
      </select>
    </div>
  );
};
