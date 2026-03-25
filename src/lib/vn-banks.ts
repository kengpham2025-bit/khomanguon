/** Mã ngân hàng → icon trong /symbol/banks/{code}.svg */
export const VN_BANKS: { code: string; name: string }[] = [
  { code: "VCB", name: "Vietcombank" },
  { code: "TCB", name: "Techcombank" },
  { code: "BIDV", name: "BIDV" },
  { code: "ACB", name: "ACB" },
  { code: "MB", name: "MB Bank" },
  { code: "VPB", name: "VPBank" },
  { code: "TPB", name: "TPBank" },
  { code: "STB", name: "Sacombank" },
  { code: "VIB", name: "VIB" },
  { code: "HDB", name: "HDBank" },
  { code: "MSB", name: "MSB" },
  { code: "OCB", name: "OCB" },
  { code: "SHB", name: "SHB" },
  { code: "EIB", name: "Eximbank" },
  { code: "SEAB", name: "SeABank" },
];

export function bankIconPath(code: string): string {
  return `/symbol/banks/${code.toUpperCase()}.svg`;
}
