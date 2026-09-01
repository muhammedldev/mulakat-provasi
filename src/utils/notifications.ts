import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// Yalnızca Android'de (native) anlamlı — web/PWA'da bu API yok, backend de
// olmadığı için bir "push" alternatifi de kurulmadı (bkz. proje notları).
const REMINDER_ID = 1001;
const REMINDER_HOUR = 20; // 20:00 yerel saat

export async function isReminderPermissionGranted(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const status = await LocalNotifications.checkPermissions();
    return status.display === "granted";
  } catch {
    return false;
  }
}

export async function requestReminderPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const status = await LocalNotifications.requestPermissions();
    return status.display === "granted";
  } catch {
    return false;
  }
}

function nextReminderDate(alreadyPlayedToday: boolean): Date {
  const target = new Date();
  target.setHours(REMINDER_HOUR, 0, 0, 0);
  // Bugün zaten oynandıysa ya da hatırlatma saati bugün için geçtiyse,
  // hatırlatma yarına kayar — aynı gün içinde tekrar rahatsız etmemek için.
  if (alreadyPlayedToday || target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

// `alreadyPlayedToday` true ise hatırlatma yarın akşama, değilse bugün
// akşama (henüz geçmediyse) planlanır. Aynı ID ile tekrar çağrılması
// öncekini otomatik olarak değiştirir (Capacitor'ın kendi davranışı).
export async function scheduleStreakReminder(alreadyPlayedToday: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: "Serin gidiyor 🔥",
          body: "Bugün henüz oynamadın. Birkaç dakikan varsa serini koru.",
          schedule: { at: nextReminderDate(alreadyPlayedToday) },
          // Bir "günlük hatırlatıcı" dakikası dakikasına kesin olmak zorunda
          // değil — varsayılan (true) Android 12+'ta kullanıcıyı otomatik
          // olarak ayrı bir "Alarms & reminders" sistem ayarı ekranına
          // yönlendiriyor (kafa karıştırıcı, gereksiz bir kesinti). false
          // ile bu yönlendirme hiç olmuyor, bildirim birkaç dakika sapmalı
          // (inexact) planlanıyor — bu kullanım için yeterli.
          isExactNotification: false,
        },
      ],
    });
  } catch {
    /* ignore */
  }
}

export async function cancelStreakReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  } catch {
    /* ignore */
  }
}
