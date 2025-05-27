export function formatPhoneNumber(input: any) {
  let value = input.replace(/\D/g, '').slice(0, 11);

  if (value.length === 0) return '';
  if (value.length < 3) return `(${value}`;
  if (value.length < 4) return `(${value.slice(0, 2)}) ${value.slice(2)}`;
  if (value.length < 8) return `(${value.slice(0, 2)}) ${value.slice(2, 3)} ${value.slice(3)}`;

  return `(${value.slice(0, 2)}) ${value.slice(2, 3)} ${value.slice(3, 7)}-${value.slice(7)}`;
}