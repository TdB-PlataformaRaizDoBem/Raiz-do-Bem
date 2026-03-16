export const validateAge = (dataNascimento: string): number => {
  if (!dataNascimento) return 0;

  const today = new Date();
  const dataNasc = new Date(dataNascimento);

  let idade = today.getFullYear() - dataNasc.getFullYear();
  const month = today.getMonth() - dataNasc.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < dataNasc.getDate())) {
    idade--;
  }

  return idade;
};