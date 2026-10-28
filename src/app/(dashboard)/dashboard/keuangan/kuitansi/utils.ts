export function terbilang(n: number): string {
  const angka = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  if (n < 12) {
    return angka[n];
  } else if (n < 20) {
    return terbilang(n - 10) + " Belas";
  } else if (n < 100) {
    return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
  } else if (n < 200) {
    return "Seratus " + terbilang(n - 100);
  } else if (n < 1000) {
    return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
  } else if (n < 2000) {
    return "Seribu " + terbilang(n - 1000);
  } else if (n < 1000000) {
    return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
  } else if (n < 1000000000) {
    return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
  } else if (n < 1000000000000) {
    return terbilang(Math.floor(n / 1000000000)) + " Miliar " + terbilang(n % 1000000000);
  }
  return "";
}

export function terbilangRupiah(nominal: number): string {
  if (nominal <= 0) return "Nol Rupiah";
  const result = terbilang(nominal).replace(/\s+/g, " ").trim();
  return result + " Rupiah";
}
