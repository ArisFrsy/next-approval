// utils/formatCurrency.ts
export const formatCurrency = (
  value: string | number,
  locale = "id-ID",
  currency = "IDR"
) => {
  const num =
    typeof value === "number"
      ? value
      : parseInt(value.replace(/[^\d]/g, "") || "0", 10);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(num);
};

export const unformatCurrency = (formatted: string) =>
  parseInt(formatted.replace(/[^\d]/g, "") || "0", 10);
