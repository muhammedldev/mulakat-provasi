// jsdom, gerçek tarayıcıların aksine window.matchMedia'yı hiç uygulamıyor —
// settings.ts modül yüklenirken bunu çağırdığı için (tema değişikliği
// dinleyicisi), test ortamında bu olmadan hiçbir dosya import edilemiyor.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
