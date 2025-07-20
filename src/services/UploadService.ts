export const saveFileToLocal = async (file: File | null): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const formData = new FormData();
  formData.append("file", file);

  const staticToken = process.env.NEXT_PUBLIC_ENCRYPT_KEY || "default_key"; // Ganti sesuai token yang diset di CI3
  const uploadApiUrl = "https://otobos.alfahuma.com/api/upload"; // Ganti sesuai URL endpoint CI3

  const response = await fetch(uploadApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${staticToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${text}`);
  }

  const result = await response.json();

  if (!result.status || !result.file_url) {
    throw new Error(`Upload failed: ${result.message || "Unknown error"}`);
  }

  // Kembalikan full URL dari file yang di-upload
  return result.file_url;
};
