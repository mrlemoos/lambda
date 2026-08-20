export type ImportedImage = string | { src: string };

export function importedImageSrc(image: ImportedImage): string {
  return typeof image === 'string' ? image : image.src;
}
