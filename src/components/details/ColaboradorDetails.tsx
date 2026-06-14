import { excluirColaborador, type ColaboradorCompleto } from "../../services/ColaboradorService";
import { formatCPF } from "../../utils/formatUtils";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import DeleteUserButton from "../ui/buttonFilters/DeleteUserButton";
import EditCoordButton from "../ui/buttonFilters/EditCoordButton";
import { Section, ColLabel } from "./Section";

type ColaboradorDetailsProps = {
  data: ColaboradorCompleto;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
};

export const ColaboradorDetails = ({
  data,
  onClose,
  onDeleted,
  onUpdated,
}: ColaboradorDetailsProps) => (
  <UserInformation>
    <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
      <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        <div className="flex justify-between items-start mb-6 pb-5 border-b border-gray-100">
          <div>
            <h3 className="text-3xl font-bold text-darkgray font-fredoka">
              {data.nomeCompleto}
            </h3>
            <div className="h-1.5 w-20 mt-1 bg-amber" />
          </div>
          <div className="text-right shrink-0 ml-4">
            <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
              ID Colaborador
            </span>
            <span className="text-lg font-mono font-bold text-darkgray">#{data.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl mb-6">
          <div>
            <p className="text-xs font-black uppercase text-gray-400">Contratado em</p>
            <p className="font-bold text-darkgray">{data.dataContratacao}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <ColLabel>Dados Pessoais</ColLabel>
            <Section
              variant="muted"
              items={[
                { label: "CPF", value: formatCPF(data.cpf), valueClass: "text-lg" },
                { label: "Nascimento", value: data.dataNascimento, valueClass: "text-lg" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-4">
            <ColLabel>Contato Corporativo</ColLabel>
            <Section
              variant="default"
              items={[
                {
                  label: "E-mail Corporativo",
                  value: (
                    <>
                      <p className="text-darkgray font-medium break-all">{data.email}</p>
                      <a
                        href={`mailto:${data.email}`}
                        className="text-xs text-darkgreen font-bold hover:underline mt-3 inline-block"
                      >
                        Enviar E-mail agora
                      </a>
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <UserActions>
        <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end w-full">
          <DeleteUserButton
            userName={data.nomeCompleto}
            onConfirm={async () => {
              await excluirColaborador(data.cpf);
              onClose();
              onDeleted();
            }}
          />
          <EditCoordButton user={data} onUpdated={onUpdated} />
          <Button variant="secondary" onClick={onClose} className="flex-1 md:flex-none">
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);
