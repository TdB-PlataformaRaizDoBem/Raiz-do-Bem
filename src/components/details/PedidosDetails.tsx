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

      <p className={`font-bold ${data.statusClass}`}>
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
        Sexo
      </h4>

      <p className="text-darkgray font-medium text-lg">
        {data.sexoLabel}
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
}) => (
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
        {data.endereco.logradouro}, {data.endereco.numero}
        <br />

        {data.endereco.bairro}
        <br />

        {data.endereco.cidade} - {data.endereco.estado}
        <br />

        <span className="text-sm font-bold">
          CEP: {data.endereco.cep}
        </span>
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
}) => (
  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
    <h4 className="text-xs font-black uppercase text-gray-400 mb-4">
      Dentista Responsável
    </h4>

    {data.dentistaAtribuido ? (
      <div className="space-y-4">
        <div>
          <p className="text-xl font-bold text-darkgray">
            {data.dentistaAtribuido.nomeCompleto}
          </p>

          <p className="text-sm text-gray-500">
            CRO: {data.dentistaAtribuido.croDentista}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-xs uppercase text-gray-400 font-bold">
              Categoria
            </h5>

            <p className="font-medium text-darkgray">
              {data.dentistaAtribuido.categoria}
            </p>
          </div>

          <div>
            <h5 className="text-xs uppercase text-gray-400 font-bold">
              Disponibilidade
            </h5>

            <p className="font-medium text-darkgray">
              {data.dentistaAtribuido.disponibilidadeLabel}
            </p>
          </div>

          <div>
            <h5 className="text-xs uppercase text-gray-400 font-bold">
              Especialidades
            </h5>

            <p className="font-medium text-darkgray">
              {data.dentistaAtribuido.especialidades.join(", ") ||
                "Não informado"}
            </p>
          </div>

          <div>
            <h5 className="text-xs uppercase text-gray-400 font-bold">
              Programas
            </h5>

            <p className="font-medium text-darkgray">
              {data.dentistaAtribuido.programasSociais.join(", ") ||
                "Não informado"}
            </p>
          </div>
        </div>
      </div>
    ) : (
      <p className="text-darkgray">
        Nenhum dentista atribuído.
      </p>
    )}
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
          {isCoord && data.statusAPI === "PENDENTE" && (
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