/**
 * Client-Side Smart Image Compressor using HTML5 Canvas API.
 * Resizes large smartphone camera photos (5MB - 15MB) to optimal web dimension
 * (max 1600px) and compresses to crisp JPEG (~200KB - 400KB) before uploading.
 * Non-image files (like PDFs) are untouched.
 */
export async function compressImageIfNeeded(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<File> {
  // Return non-image files (like PDF) as-is
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // If already lightweight (< 400KB), return as-is
  if (file.size < 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // If dimensions are within bounds and file is relatively small
        if (width <= maxDimension && height <= maxDimension && file.size < 800 * 1024) {
          resolve(file);
          return;
        }

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Create new File with original name but compressed content
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
