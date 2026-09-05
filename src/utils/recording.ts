// Konuşma Pratiği modu için mikrofon kaydı. Web'de ve Android'de (Capacitor
// WebView) aynı standart getUserMedia/MediaRecorder API'leri kullanılıyor —
// TTS'in aksine bu API'ler WebView'de gerçekten mevcut, tek şart
// AndroidManifest.xml'de RECORD_AUDIO + MODIFY_AUDIO_SETTINGS izinlerinin
// ikisinin birden bulunması (Capacitor'ın izin köprüsü ikisini birden istiyor,
// biri eksikse tüm istek sessizce reddediliyor — emülatörde canlı test edilip
// bulundu). Kayıtlar hiçbir yere kaydedilmiyor/gönderilmiyor, sadece anlık
// dinleme için RAM'de tutuluyor.

export function isRecordingSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices && typeof MediaRecorder !== "undefined";
}

export interface RecordingStats {
  durationMs: number;
  // null: ses seviyesi analizi bu ortamda kurulamadı (ör. AudioContext
  // desteklenmiyor) — bu durumda "duraksama yok" gibi yanlış bir kesinlik
  // göstermek yerine arayüz bu kısmı hiç göstermiyor.
  pauseAnalysis: { silenceCount: number; longestSilenceMs: number } | null;
}

export interface ActiveRecording {
  stop: () => Promise<{ blob: Blob; stats: RecordingStats }>;
}

// Duraksama tespiti: STT/dil analizi değil, ham ses genliği (RMS) ölçümü —
// bu yüzden dilden/doğruluktan bağımsız, hata payı yok. 700ms'den kısa
// boşluklar kelimeler arası doğal duraklar sayılıp göz ardı ediliyor.
const SILENCE_RMS_THRESHOLD = 0.02;
const SAMPLE_INTERVAL_MS = 200;
const MIN_PAUSE_MS = 700;

function setupPauseAnalysis(stream: MediaStream) {
  // Bu kurulum ayrı bir try/catch'te tutuluyor: burada bir şey ters giderse
  // (ör. AudioContext bu ortamda yoksa) asıl kayıt yine de bozulmadan devam
  // etmeli — sadece duraksama istatistiğinden vazgeçiyoruz, mikrofon akışını
  // elde tutmaya devam ediyoruz.
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  const timeData = new Uint8Array(analyser.fftSize);

  let silentRunMs = 0;
  let longestSilenceMs = 0;
  let silenceCount = 0;

  const flushPauseIfAny = () => {
    if (silentRunMs >= MIN_PAUSE_MS) {
      silenceCount++;
      longestSilenceMs = Math.max(longestSilenceMs, silentRunMs);
    }
    silentRunMs = 0;
  };

  const sampleTimer = setInterval(() => {
    analyser.getByteTimeDomainData(timeData);
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i++) {
      const normalized = (timeData[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / timeData.length);
    if (rms < SILENCE_RMS_THRESHOLD) {
      silentRunMs += SAMPLE_INTERVAL_MS;
    } else {
      flushPauseIfAny();
    }
  }, SAMPLE_INTERVAL_MS);

  return {
    stop: () => {
      clearInterval(sampleTimer);
      flushPauseIfAny();
      source.disconnect();
      void audioCtx.close();
      return { silenceCount, longestSilenceMs };
    },
  };
}

export async function startRecording(): Promise<ActiveRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
  });
  const startedAt = Date.now();
  recorder.start();

  let pauseAnalyzer: ReturnType<typeof setupPauseAnalysis> | null = null;
  try {
    pauseAnalyzer = setupPauseAnalysis(stream);
  } catch {
    pauseAnalyzer = null;
  }

  return {
    stop: () => {
      const durationMs = Date.now() - startedAt;
      const pauseResult = pauseAnalyzer?.stop() ?? null;
      if (recorder.state !== "inactive") recorder.stop();
      stream.getTracks().forEach((t) => t.stop());
      return stopped.then((blob) => ({
        blob,
        stats: { durationMs, pauseAnalysis: pauseResult },
      }));
    },
  };
}
