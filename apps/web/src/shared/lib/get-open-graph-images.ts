/**
 * Без metadataBase относительный URL нельзя использовать в Open Graph: внешние
 * сервисы не смогут определить домен изображения до выбора адреса сайта.
 */
export function getOpenGraphImages(imageUrl: string | null): { url: string }[] | undefined {
  if (!imageUrl) return undefined;

  try {
    const url = new URL(imageUrl);
    return url.protocol === 'http:' || url.protocol === 'https:' ? [{ url: imageUrl }] : undefined;
  } catch {
    return undefined;
  }
}
