const MAX_DIMENSION = 400;
const JPEG_QUALITY = 0.85;

/**
 * Compresses an image file to a maximum dimension and JPEG quality.
 * Returns a Promise resolving to a base64 data URL.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Nieprawidłowy format obrazu.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Przeglądarka nie obsługuje przetwarzania obrazu.'));
          return;
        }
        // JPEG has no alpha channel — paint white so transparent PNGs don't turn black
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

