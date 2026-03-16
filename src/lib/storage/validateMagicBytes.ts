/**
 * Valide les magic bytes d'un buffer pour vérifier que le contenu correspond
 * réellement au type MIME déclaré (protection contre le renommage de fichiers malveillants).
 */

interface MagicBytesResult {
  valid: boolean
  error?: string
}

export function validateMagicBytes(buffer: Buffer, mimeType: string): MagicBytesResult {
  if (buffer.length < 4) {
    return { valid: false, error: 'INVALID_FILE' }
  }

  switch (mimeType) {
    case 'image/jpeg': {
      // JPEG : FF D8 FF
      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return { valid: true }
      }
      return { valid: false, error: 'MAGIC_BYTES_MISMATCH' }
    }
    case 'image/png': {
      // PNG : 89 50 4E 47 0D 0A 1A 0A
      if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      ) {
        return { valid: true }
      }
      return { valid: false, error: 'MAGIC_BYTES_MISMATCH' }
    }
    case 'image/webp': {
      // WebP : RIFF????WEBP → bytes 0-3 = 52 49 46 46, bytes 8-11 = 57 45 42 50
      if (
        buffer.length >= 12 &&
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      ) {
        return { valid: true }
      }
      return { valid: false, error: 'MAGIC_BYTES_MISMATCH' }
    }
    default:
      return { valid: false, error: 'UNSUPPORTED_FORMAT' }
  }
}
