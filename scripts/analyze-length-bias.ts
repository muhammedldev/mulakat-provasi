import { questionPool } from "../src/data/questions";
import { termCards } from "../src/data/terms";
import { vakaQuestions, psikolojiQuestions } from "../src/data/rapidQuestions";

function analyzeQuestionLike(name: string, items: { options: { text: string; isBest?: boolean }[] }[]) {
  let longestIsBest = 0;
  const total = items.length;
  let avgBestLen = 0, avgOtherLen = 0, bestCount = 0, otherCount = 0;
  items.forEach((q) => {
    const lens = q.options.map((o) => o.text.length);
    const maxLen = Math.max(...lens);
    const bestIdx = q.options.findIndex((o) => o.isBest);
    if (bestIdx === -1) return;
    if (lens[bestIdx] === maxLen) longestIsBest++;
    q.options.forEach((o, i) => {
      if (i === bestIdx) { avgBestLen += o.text.length; bestCount++; }
      else { avgOtherLen += o.text.length; otherCount++; }
    });
  });
  console.log(`\n=== ${name} ===`);
  console.log(`Toplam soru: ${total}`);
  console.log(`Dogru cevap = en uzun sik: ${longestIsBest}/${total} (%${Math.round((longestIsBest / total) * 100)})`);
  console.log(`Ortalama dogru cevap uzunlugu: ${(avgBestLen / bestCount).toFixed(1)} karakter`);
  console.log(`Ortalama yanlis cevap uzunlugu: ${(avgOtherLen / otherCount).toFixed(1)} karakter`);
}

analyzeQuestionLike("Klasik Havuz (questionPool)", questionPool);
analyzeQuestionLike("Seri Mulakat - Vaka", vakaQuestions);
analyzeQuestionLike("Seri Mulakat - Psikoloji", psikolojiQuestions);

let termLongestCorrect = 0;
let avgCorrectLen = 0, avgOtherLen2 = 0, correctCount = 0, otherCount2 = 0;
termCards.forEach((t) => {
  const lens = t.options.map((o) => o.length);
  const maxLen = Math.max(...lens);
  if (lens[t.correctIndex] === maxLen) termLongestCorrect++;
  t.options.forEach((o, i) => {
    if (i === t.correctIndex) { avgCorrectLen += o.length; correctCount++; }
    else { avgOtherLen2 += o.length; otherCount2++; }
  });
});
console.log(`\n=== Terim Kuresi (termCards) ===`);
console.log(`Toplam terim: ${termCards.length}`);
console.log(`Dogru cevap = en uzun sik: ${termLongestCorrect}/${termCards.length} (%${Math.round((termLongestCorrect / termCards.length) * 100)})`);
console.log(`Ortalama dogru cevap uzunlugu: ${(avgCorrectLen / correctCount).toFixed(1)} karakter`);
console.log(`Ortalama yanlis cevap uzunlugu: ${(avgOtherLen2 / otherCount2).toFixed(1)} karakter`);
