// Plano gratuito do Supabase: 1 GB de Storage. Mirando ~200 KB por foto cabem milhares de peças.
const TARGET_BYTES = 200 * 1024;
const MAX_BYTES = 400 * 1024;
const encode = (canvas: HTMLCanvasElement, type: string, quality: number) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality));
export async function optimizeImage(file: File): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Escolha fotos em JPG, PNG ou WebP. Para HEIC, exporte a foto como JPG.');
  if (file.size > 25 * 1024 * 1024) throw new Error('A foto deve ter até 25 MB antes da otimização.');
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('Não foi possível abrir esta foto. Escolha outro arquivo.')); img.src = url;
    });
    let best: Blob | null = null;
    // Reduz primeiro a qualidade e, se ainda estiver pesada, a resolução.
    for (const side of [1200, 1000, 800]) {
      const scale = Math.min(1, side / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
      const context = canvas.getContext('2d'); if (!context) throw new Error('Seu navegador não conseguiu otimizar a imagem.');
      context.fillStyle = '#FFFEFA'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.8, 0.7, 0.6, 0.5]) {
        let blob = await encode(canvas, 'image/webp', quality);
        if (!blob || blob.type !== 'image/webp') blob = await encode(canvas, 'image/jpeg', quality);
        if (blob && (!best || blob.size < best.size)) best = blob;
        if (best && best.size <= TARGET_BYTES) return best;
      }
    }
    if (!best || best.size > MAX_BYTES) throw new Error('Esta foto continua muito grande. Escolha uma imagem menos complexa.');
    return best;
  } finally { URL.revokeObjectURL(url); }
}
export async function blobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
}
