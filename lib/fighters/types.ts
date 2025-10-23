export type Fighter = {
  id: string; // "terence-crawford-1987"
  fullName: string;
  nickName?: string;
  division: string;
  record: { wins: number; losses: number; draws: number; kos?: number };
  stance?: "orthodox" | "southpaw" | "switch";
  nationality?: string;
  height?: string;
  reach?: string;
  age?: number;
  isChampion?: boolean;
  orgs?: string[];
  photo: string;
  socials?: { instagram?: string; twitter?: string; youtube?: string };
  lastUpdated: string;
};
