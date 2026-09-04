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

export interface ActiveRecording {
  stop: () => Promise<Blob>;
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
  recorder.start();
  return {
    stop: () => {
      if (recorder.state !== "inactive") recorder.stop();
      stream.getTracks().forEach((t) => t.stop());
      return stopped;
    },
  };
}
