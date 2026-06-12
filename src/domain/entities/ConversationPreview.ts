export interface ConversationPreview {
  tel_client: string;
  text: string | null;
  date_time: string;
  direction: "entrada" | "saida";
  unread_count: number;
}