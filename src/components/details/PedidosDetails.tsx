import type { PedidoCompleto } from "../../services/PedidoService";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";

type PedidoDetailsProps = {
  data: PedidoCompleto;
  isCoord: boolean;
  onAprovar: () => void;
  onSuspender: () => void;
  onClose: () => void;
};

const SecaoStatus = ({ data }: { data: PedidoCompleto }) => (
  <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
    <div>
      <p className="text-xs font-black uppercase text-gray-400">
        Situação Atual
      </p>
      <p
        className={`font-bold ${
          data.situacao === "Aprovado"
            ? "text-darkgreen"
            : data.situacao === "Negado"
            ? "text-red-500"
            : "text-amber"
        }`}
      >
        {data.situacao}
      </p>
    </div>

    <div className="w-px h-8 bg-gray-200" />

    <div>
      <p className="text-xs font-black uppercase text-gray-400">
        Data do Envio
      </p>
      <p className="font-bold text-darkgray">{data.data}</p>
    </div>
  </div>
);

const SecaoDescricao = ({ data }: { data: PedidoCompleto }) => (
  <div className="bg-amber/5 p-6 rounded-2xl border border-amber/10">
    <h4 className="text-xs font-black uppercase text-amber tracking-wider mb-3">
      Descrição da Solicitação
    </h4>
    <p className="text-darkgray leading-relaxed text-lg">
      "{data.descricao_problema}"
    </p>
  </div>
);

const SecaoContato = ({ data }: { data: PedidoCompleto }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <h4 className="text-xs font-black uppercase text-gray-400 mb-2">
        E-mail
      </h4>
      <p className="text-darkgray font-medium break-all">{data.email}</p>
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
      <p className="text-darkgray font-medium">{data.telefone}</p>
      <a
        href={`https://wa.me/55${data.telefone.replace(/\D/g, "")}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-darkgreen font-bold hover:underline mt-2 inline-block"
      >
        Chamar no WhatsApp
      </a>
    </div>
  </div>
);

export const PedidoDetails = ({
  data,
  isCoord,
  onAprovar,
  onSuspender,
  onClose,
}: PedidoDetailsProps) => (
  <UserInformation>
    <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
      <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 custom-scrollbar">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-3xl font-bold text-darkgray font-fredoka">
              {data.nome_completo}
            </h3>
            <div className="h-1.5 w-20 bg-amber mt-1" />
          </div>

          <div className="text-right">
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
          <SecaoDescricao data={data} />
          <SecaoContato data={data} />
        </div>
      </div>

      <UserActions>
        <div className="flex flex-wrap gap-3 justify-end">
          {isCoord && data.situacao === "Pendente" && (
            <>
              <Button variant="secondary" onClick={onAprovar}>
                Aprovar
              </Button>

              <Button variant="danger" onClick={onSuspender}>
                Suspender
              </Button>
            </>
          )}

          <Button variant="primary" onClick={() => window.print()}>
            Imprimir Relatório
          </Button>

          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);