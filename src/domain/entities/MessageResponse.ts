export interface MessageResponse {
  id_db: string;
  id_message_twilio: string;
  tel_client: string;
  text: string;
  direction: "entrada" | "saida";
  date_time: string;
  url_midia?: string | null;
  id_colaborador?: number | null;
}