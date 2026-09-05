import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

interface ShareCardData {
  emoji: string;
  rank: "bronze" | "silver" | "gold" | "platinum";
  rankLabel: string;
  title: string;
  score: number;
  stats: { label: string; icon: string; value: number; color: string }[];
  tipLabel: string;
  tip: string;
  footer: string;
}

// Keyed by the rank enum (ASCII, locale-independent) rather than the localized
// display label — Turkish uppercasing turns "i" into a dotless "I", which would
// silently break a lookup keyed on the uppercased Turkish text.
const rankSealColor: Record<ShareCardData["rank"], string> = {
  bronze: "#e0a45c",
  silver: "#cbd5e1",
  gold: "#fbbf24",
  platinum: "#7dd3fc",
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
}

// Instagram-story-friendly şekilde tasarlanmış bir "başarı kartı" — bir HR'ın
// arşivleyebileceği kadar okunaklı, ama bir üniversiteli arkadaşına gönderirken
// utanmayacağı kadar canlı/paylaşılası olması hedeflendi (önceki sürüm çok
// donuk/kurumsal duruyordu, kimse story'sine atmak istemezdi).
export function generateShareImage(data: ShareCardData): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  const sealColor = rankSealColor[data.rank];

  // Base: koyu lacivertten mora diyagonal geçiş — düz kurumsal lacivert yerine
  // enerjik ama hâlâ "gece modu" hissi veren bir zemin.
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#1a1533");
  grad.addColorStop(0.55, "#161129");
  grad.addColorStop(1, "#0c1a2e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Yumuşak renkli "blob" ışıkları — derinlik katıyor, blur filtresi olmadan.
  const glow = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  glow(650, 120, 320, "rgba(139,92,246,0.28)");
  glow(120, 950, 300, "rgba(13,148,136,0.24)");
  glow(400, 260, 260, `${sealColor}26`);

  // Header
  ctx.textAlign = "left";
  ctx.fillStyle = "#f4f2ff";
  ctx.font = "800 27px 'Segoe UI', sans-serif";
  ctx.fillText("🎤 Mika · Mülakat Provası", 56, 76);

  ctx.textAlign = "right";
  const dateStr = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  ctx.fillStyle = "rgba(244,242,255,0.55)";
  ctx.font = "500 16px 'Segoe UI', sans-serif";
  ctx.fillText(dateStr, canvas.width - 56, 76);

  // Rütbe rozeti — düz çember yerine ışıltılı bir "sticker" hissi.
  const sealX = canvas.width / 2;
  const sealY = 260;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 98, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = sealColor;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "84px 'Segoe UI', sans-serif";
  ctx.fillText(data.emoji, sealX, sealY + 30);

  // Rütbe etiketi — renkli pill.
  ctx.font = "800 17px 'Segoe UI', sans-serif";
  const rankPillW = ctx.measureText(data.rankLabel).width + 44;
  const rankPillY = 378;
  ctx.fillStyle = `${sealColor}29`;
  ctx.beginPath();
  ctx.roundRect(sealX - rankPillW / 2, rankPillY - 24, rankPillW, 40, 20);
  ctx.fill();
  ctx.fillStyle = sealColor;
  ctx.fillText(data.rankLabel, sealX, rankPillY + 5);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 44px 'Segoe UI', sans-serif";
  ctx.fillText(data.title, sealX, 448);

  ctx.fillStyle = "#a78bfa";
  ctx.font = "800 76px 'Segoe UI', sans-serif";
  ctx.fillText(`${data.score}`, sealX, 542);
  ctx.fillStyle = "rgba(244,242,255,0.6)";
  ctx.font = "600 20px 'Segoe UI', sans-serif";
  ctx.fillText("/ 100 · Genel Skor", sealX, 570);

  // İstatistik çubukları — ikonlu, pill şekilli, kart üzerinde.
  const barWidth = 600;
  const barX = (canvas.width - barWidth) / 2;
  const statsCardY = 610;
  const statsCardH = data.stats.length * 66 + 32;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath();
  ctx.roundRect(barX, statsCardY, barWidth, statsCardH, 20);
  ctx.fill();

  let barY = statsCardY + 44;
  data.stats.forEach((s) => {
    ctx.textAlign = "left";
    ctx.font = "600 22px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#f4f2ff";
    ctx.fillText(`${s.icon} ${s.label}`, barX + 24, barY - 10);
    ctx.textAlign = "right";
    ctx.fillStyle = s.color;
    ctx.font = "800 22px 'Segoe UI', sans-serif";
    ctx.fillText(String(s.value), barX + barWidth - 24, barY - 10);

    const trackX = barX + 24;
    const trackW = barWidth - 48;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.roundRect(trackX, barY, trackW, 14, 7);
    ctx.fill();

    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.roundRect(trackX, barY, trackW * (s.value / 100), 14, 7);
    ctx.fill();

    barY += 66;
  });

  // Gelişim ipucu — sol renkli şeritli, daha sıcak/samimi bir kart.
  const cardX = barX;
  const cardW = barWidth;
  const cardY = statsCardY + statsCardH + 24;
  const cardH = 168;
  ctx.fillStyle = "rgba(167,139,250,0.1)";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 18);
  ctx.fill();
  ctx.fillStyle = "#a78bfa";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, 6, cardH, 3);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.fillStyle = "#c4b5fd";
  ctx.font = "800 20px 'Segoe UI', sans-serif";
  ctx.fillText(`💡 ${data.tipLabel} için ipucu`, cardX + 30, cardY + 40);

  ctx.fillStyle = "rgba(244,242,255,0.82)";
  ctx.font = "500 19px 'Segoe UI', sans-serif";
  const tipLines = wrapText(ctx, data.tip, cardW - 60).slice(0, 4);
  tipLines.forEach((line, i) => {
    ctx.fillText(line, cardX + 30, cardY + 76 + i * 27);
  });

  // Footer — küçük bir marka rozeti, itiraf/dipnot havası yerine.
  ctx.textAlign = "center";
  ctx.font = "700 17px 'Segoe UI', sans-serif";
  const footerW = ctx.measureText(data.footer).width + 40;
  const footerY = canvas.height - 56;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.roundRect(canvas.width / 2 - footerW / 2, footerY - 26, footerW, 40, 20);
  ctx.fill();
  ctx.fillStyle = "rgba(244,242,255,0.85)";
  ctx.fillText(data.footer, canvas.width / 2, footerY + 1);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function downloadShareImage(data: ShareCardData, filename: string): Promise<boolean> {
  const blob = await generateShareImage(data);
  if (!blob) return false;

  // Android WebView'de <a download> hiçbir şey yapmıyor (sessizce no-op) —
  // native tarafta dosyayı gerçekten diske yazıp native paylaşım ekranını
  // (WhatsApp/Galeri/Dosyalar) açmamız gerekiyor.
  if (Capacitor.isNativePlatform()) {
    try {
      const base64 = await blobToBase64(blob);
      const written = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
      await Share.share({ title: "Mülakat Provası Sonuç Raporu", url: written.uri });
      return true;
    } catch {
      return false;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
