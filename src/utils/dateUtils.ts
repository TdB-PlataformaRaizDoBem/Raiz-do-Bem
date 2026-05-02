export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—";
  const dateParts = dateString.split('-');
  
  if (dateParts.length === 3) {
    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  }

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat('pt-BR').format(date);
};