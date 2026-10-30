export async function optimizeImage(file: File): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Escolha fotos em JPG, PNG ou WebP. Para HEIC, exporte a foto como JPG.');
  if (file.size > 25 * 1024 * 1024) throw new Error('A foto deve ter até 25 MB antes da otimização.');
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('Não foi possível abrir esta foto. Escolha outro arquivo.')); img.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext('2d'); if (!context) throw new Error('Seu navegador não conseguiu otimizar a imagem.');
    context.fillStyle = '#FFFEFA'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let blob: Blob | null = null;
    for (const quality of [0.86, 0.76, 0.65]) {
      blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (!blob || !['image/webp', 'image/jpeg'].includes(blob.type)) {
        blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      }
      if (blob && blob.size <= 500 * 1024) break;
    }
    if (!blob || blob.size > 1024 * 1024) throw new Error('Esta foto continua muito grande. Escolha uma imagem menos complexa.');
    return blob;
  } finally { URL.revokeObjectURL(url); }
}
export async function blobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
}
