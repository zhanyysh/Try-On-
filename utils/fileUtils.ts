
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const stripBase64Prefix = (base64String: string): string => {
  const parts = base64String.split(',');
  if (parts.length > 1) {
    return parts[1];
  }
  return base64String;
};
