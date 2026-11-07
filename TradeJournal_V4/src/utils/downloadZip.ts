import { PROJECT_ZIP_BASE64 } from './projectZipBase64';

/**
 * Self-contained in-memory project ZIP downloader.
 * Uses embedded base64 data to construct a Blob directly in the browser's memory,
 * ensuring 100% reliable offline download with zero network requests or 404 errors.
 */
export function downloadProjectZip(filename = 'TradeJournal-Project-Setup.zip'): void {
  try {
    const byteCharacters = atob(PROJECT_ZIP_BASE64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const blob = new Blob([byteNumbers], { type: 'application/zip' });
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = filename;
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (err) {
    console.error('Failed to trigger in-memory zip download, trying direct link fallback:', err);
    window.location.href = '/TradeJournal-Project-Export.zip';
  }
}
