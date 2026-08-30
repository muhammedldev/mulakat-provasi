interface ShareCardData {
  emoji: string;
  rank: "bronze" | "silver" | "gold" | "platinum";
  rankLabel: string;
  title: string;
  score: number;
  stats: { label: string; value: number; color: string }[];
  tipLabel: string;
  tip: string;
  footer: string;
}

// Keyed by the rank enum (ASCII, locale-independent) rather than the localized
// display label — Turkish uppercasing turns "i" into a dotless "I", which would
// silently break a lookup keyed on the uppercased Turkish text.
const rankSealColor: Record<ShareCardData["rank"], string> = {
  bronze: "#cd7f32",
  silver: "#b9c4d3",
  gold: "#facc15",
  platinum: "#60a5fa",
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

// A compact, report-style summary card — designed so an HR professional could
// forward it to a candidate as a legible practice record, not just a flex screenshot.
export function generateShareImage(data: ShareCardData): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#0a1220");
  grad.addColorStop(1, "#101a2c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(96,165,250,0.1)";
  ctx.beginPath();
  ctx.arc(680, 90, 220, 0, Math.PI * 2);
  ctx.fill();

  // Header
  ctx.textAlign = "left";
  ctx.fillStyle = "#eef2f7";
  ctx.font = "700 26px 'Segoe UI', sans-serif";
  ctx.fillText("🎤 Mülakat Provası", 60, 74);
  ctx.fillStyle = "#8695a8";
  ctx.font = "500 18px 'Segoe UI', sans-serif";
  ctx.fillText("Pratik Sonuç Raporu", 60, 102);

  ctx.textAlign = "right";
  const dateStr = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  ctx.fillStyle = "#6b7789";
  ctx.font = "500 16px 'Segoe UI', sans-serif";
  ctx.fillText(dateStr, canvas.width - 60, 88);

  ctx.strokeStyle = "#2b3a4f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 130);
  ctx.lineTo(canvas.width - 60, 130);
  ctx.stroke();

  // Rank seal
  const sealColor = rankSealColor[data.rank];
  const sealX = canvas.width / 2;
  const sealY = 250;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 92, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = sealColor;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sealX, sealY, 80, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "78px 'Segoe UI', sans-serif";
  ctx.fillText(data.emoji, sealX, sealY + 28);

  ctx.fillStyle = sealColor;
  ctx.font = "800 20px 'Segoe UI', sans-serif";
  ctx.fillText(data.rankLabel, sealX, 372);

  ctx.fillStyle = "#eef2f7";
  ctx.font = "700 42px 'Segoe UI', sans-serif";
  ctx.fillText(data.title, sealX, 422);

  ctx.fillStyle = "#60a5fa";
  ctx.font = "800 64px 'Segoe UI', sans-serif";
  ctx.fillText(`${data.score}/100`, sealX, 500);
  ctx.fillStyle = "#6b7789";
  ctx.font = "500 18px 'Segoe UI', sans-serif";
  ctx.fillText("Genel Skor", sealX, 528);

  // Stat bars
  const barWidth = 560;
  const barX = (canvas.width - barWidth) / 2;
  let barY = 600;
  data.stats.forEach((s) => {
    ctx.textAlign = "left";
    ctx.fillStyle = "#b9c4d3";
    ctx.font = "600 22px 'Segoe UI', sans-serif";
    ctx.fillText(s.label, barX, barY - 10);
    ctx.textAlign = "right";
    ctx.fillText(String(s.value), barX + barWidth, barY - 10);

    ctx.fillStyle = "#2b3a4f";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, 16, 8);
    ctx.fill();

    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * (s.value / 100), 16, 8);
    ctx.fill();

    barY += 62;
  });

  // Development tip callout
  const cardX = barX;
  const cardW = barWidth;
  const cardY = barY + 20;
  ctx.fillStyle = "rgba(96,165,250,0.08)";
  ctx.strokeStyle = "rgba(96,165,250,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, 160, 16);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#60a5fa";
  ctx.font = "700 20px 'Segoe UI', sans-serif";
  ctx.fillText(`🎯 Gelişim Alanı — ${data.tipLabel}`, cardX + 24, cardY + 38);

  ctx.fillStyle = "#b9c4d3";
  ctx.font = "500 19px 'Segoe UI', sans-serif";
  const tipLines = wrapText(ctx, data.tip, cardW - 48).slice(0, 4);
  tipLines.forEach((line, i) => {
    ctx.fillText(line, cardX + 24, cardY + 72 + i * 27);
  });

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#6b7789";
  ctx.font = "500 17px 'Segoe UI', sans-serif";
  ctx.fillText(data.footer, canvas.width / 2, canvas.height - 60);
  ctx.fillStyle = "#4b5768";
  ctx.font = "500 14px 'Segoe UI', sans-serif";
  ctx.fillText("Bu rapor, aday hazırlık sürecini desteklemek amacıyla oluşturulmuş bir pratik özetidir.", canvas.width / 2, canvas.height - 36);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

export async function downloadShareImage(data: ShareCardData, filename: string): Promise<boolean> {
  const blob = await generateShareImage(data);
  if (!blob) return false;
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
