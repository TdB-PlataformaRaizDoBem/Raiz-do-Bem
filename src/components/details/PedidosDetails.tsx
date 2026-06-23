import { useNavigate } from "react-router-dom";
import type { PedidoViewModel } from "../../domain/mappers/PedidoMapper";

import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";

import { Button } from "../ui/Button";

type PedidoDetailsProps = {
  data: PedidoViewModel;
  isCoord: boolean;
  onAprovar: () => void;
  onSuspender: () => void;
  onClose: () => void;
};

const SecaoStatus = ({ data }: { data: PedidoViewModel }) => (
  <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
    <div>
      <p className="text-xs font-black uppercase text-gray-400">
        Situação Atual
      </p>

      <p className={`font-bold ${data.statusClass} bg-transparent`}>
        {data.statusLabel}
      </p>
    </div>

    <div className="w-px h-8 bg-gray-200" />

    <div>
      <p className="text-xs font-black uppercase text-gray-400">
        Data do Envio
      </p>

      <p className="font-bold text-darkgray">
        {data.dataPedido}
      </p>
    </div>
  </div>
);

const SecaoDadosPessoais = ({
  data,
}: {
  data: PedidoViewModel;
}) => (
  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h4 className="text-xs font-black uppercase text-gray-400 mb-1">
        CPF
      </h4>

      <p className="text-darkgray font-medium text-lg">
        {data.cpf}
      </p>
    </div>

    <div>
      <h4 className="text-xs font-black uppercase text-gray-400 mb-1">
        Data de Nascimento
      </h4>

      <p className="text-darkgray font-medium text-lg">
        {data.dataNascimento}
      </p>
    </div>
  </div>
);

const SecaoDescricao = ({
  data,
}: {
  data: PedidoViewModel;
}) => (
  <div className="bg-amber/5 p-6 rounded-2xl border border-amber/10">
    <h4 className="text-xs font-black uppercase text-amber tracking-wider mb-3">
      Descrição da Solicitação
    </h4>

    <p className="text-darkgray leading-relaxed text-lg">
      "{data.descricaoProblema}"
    </p>
  </div>
);

const SecaoContato = ({
  data,
}: {
  data: PedidoViewModel;
}) => {
  const navigate = useNavigate();

  /** Converte qualquer formato de telefone para +55XXXXXXXXXXX */
  function buildChatUrl(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
  
  // Detecta se você está no painel /admin ou /coord
  const prefix = window.location.pathname.includes('/admin') ? '/admin' : '/coord';
  
  // Retorna a URL absoluta perfeita casando com a rota acima
  return `${prefix}/chat/${encodeURIComponent(normalized)}`;
}

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <h4 className="text-xs font-black uppercase text-gray-400 mb-2">
          E-mail
        </h4>

        <p className="text-darkgray font-medium break-all">
          {data.email}
        </p>

        <a
          href={`mailto:${data.email}`}
          className="text-xs text-darkgreen font-bold hover:underline mt-2 inline-block"
        >
          Email de Contato
        </a>
      </div>

      <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <h4 className="text-xs font-black uppercase text-gray-400 mb-2">
          Telefone / WhatsApp
        </h4>

        <p className="text-darkgray font-medium">
          {data.telefone}
        </p>

        {/* IT-01: Botão redirecionando internamente para /atendimento/chat/:telefone */}
        <button
          onClick={() => navigate(buildChatUrl(data.telefone))}
          className="text-xs text-darkgreen font-bold hover:underline mt-2 inline-flex items-center gap-1 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.52 3.48A11.84 11.84 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.57A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.85 0-3.66-.5-5.24-1.44l-.37-.22-3.87.99 1.02-3.76-.24-.38A9.94 9.94 0 0 1 2 12C2 6.48 6.48 2 12 2a9.97 9.97 0 0 1 7.07 2.93A9.97 9.97 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.44-7.47c-.3-.15-1.76-.87-2.03-.96-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16c-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.41-1.5-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51H6.8c-.2 0-.5.07-.77.37C5.76 7.77 5 8.55 5 10.11c0 1.57 1.14 3.09 1.3 3.3.17.2 2.25 3.44 5.46 4.82.76.33 1.36.52 1.82.67.77.24 1.47.21 2.02.12.62-.1 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.28-.2-.58-.35z"
              fill="#006a4e"
            />
          </svg>
          Abrir chat de atendimento
        </button>
      </div>
    </div>
  );
};

const SecaoEndereco = ({
  data,
}: {
  data: PedidoViewModel;
}) => (
  <div className="bg-amber/5 p-6 rounded-2xl border border-amber/10">
    <h4 className="text-xs font-black uppercase text-amber tracking-wider mb-3">
      Endereço
    </h4>

    {data.endereco ? (
      <p className="text-darkgray leading-relaxed text-lg">
        {data.endereco}
      </p>
    ) : (
      <p className="text-darkgray">
        Endereço não informado.
      </p>
    )}
  </div>
);

const SecaoDentista = ({
  data,
}: {
  data: PedidoViewModel;
}) => {
  return (
    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
      <h4 className="text-xs font-black uppercase text-gray-400 mb-4">
        Dentista Responsável
      </h4>

      {data.dentistaResponsavel ? (
        <div className="space-y-2">
          <p className="text-lg font-bold text-darkgray">
            {data.dentistaResponsavel}
          </p>
        </div>
      ) : (
        <p className="text-darkgray">
          Nenhum dentista atribuído.
        </p>
      )}
    </div>
  );
};

export const PedidoDetails = ({
  data,
  onAprovar,
  onSuspender,
  onClose,
}: PedidoDetailsProps) => (
  <UserInformation>
    <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
      <div
        className="
          flex-1
          overflow-y-auto
          overflow-x-hidden
          pb-24
          p-1
          pr-2
          [scrollbar-width:none]
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <div className="flex justify-between items-start mb-4 gap-4">
          <div>
            <h3 className="text-3xl font-bold text-darkgray font-fredoka break-words">
              {data.nomeCompleto}
            </h3>

            <div className="h-1.5 w-20 bg-amber mt-1" />
          </div>

          <div className="text-right shrink-0">
            <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
              Protocolo
            </span>

            <span className="text-lg font-mono font-bold text-darkgray">
              #{data.id}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <SecaoStatus data={data} />

          <SecaoDadosPessoais data={data} />

          <SecaoDescricao data={data} />

          <SecaoContato data={data} />

          <SecaoEndereco data={data} />

          <SecaoDentista data={data} />
        </div>
      </div>

      <UserActions>
        <div className="flex flex-wrap gap-3 justify-end">
          {data.statusAPI === "PENDENTE" && (
            <>
              <Button
                variant="secondary"
                onClick={onAprovar}
              >
                Aprovar
              </Button>

              <Button
                variant="danger"
                onClick={onSuspender}
              >
                Suspender
              </Button>
            </>
          )}

          <Button
            variant="primary"
            onClick={() => window.print()}
          >
            Imprimir Relatório
          </Button>

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);
