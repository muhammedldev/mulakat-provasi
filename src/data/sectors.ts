import type { SectorId } from "../types";

export interface SectorMeta {
  id: SectorId;
  label: string;
  icon: string;
  description: string;
}

export const sectors: SectorMeta[] = [
  {
    id: "yazilim",
    label: "Yazılım & Teknoloji",
    icon: "💻",
    description: "Kod inceleme, teknik iletişim ve ürün ekibiyle işbirliği gibi sektöre özel senaryolar.",
  },
  {
    id: "satis-pazarlama",
    label: "Satış & Pazarlama",
    icon: "📈",
    description: "Müşteri itirazları, kampanya sonuçları ve hedef baskısı gibi sektöre özel senaryolar.",
  },
];
