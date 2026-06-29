export interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

export async function fetchBanks(): Promise<Bank[]> {
  const res = await fetch("https://api.vietqr.io/v2/banks");
  if (!res.ok) {
    throw new Error("Failed to fetch banks");
  }
  const data = await res.json();
  return data.data;
}
