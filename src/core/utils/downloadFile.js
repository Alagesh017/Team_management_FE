/** Save bytes in browser (anchor download) or Electron (Save dialog). */
export async function downloadBinaryFile(fileName, data, mimeType = "application/octet-stream") {
  const bytes =
    data instanceof Uint8Array ? data : data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data);

  const desktop = typeof window !== "undefined" ? window.teamManagerDesktop : null;
  if (desktop?.isDesktop && typeof desktop.saveDownload === "function") {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const dataBase64 = btoa(binary);
    return desktop.saveDownload({ fileName, dataBase64, mimeType });
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { ok: true };
}

export async function downloadTextFile(fileName, text, mimeType = "text/plain;charset=utf-8") {
  const encoder = new TextEncoder();
  return downloadBinaryFile(fileName, encoder.encode(text), mimeType);
}
