import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

const MAX_WIDTH = 1200
const THUMBNAIL_WIDTH = 400
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface UploadResult {
  photoUrl: string
  thumbnailUrl: string
  key: string
  thumbnailKey: string
}

function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_BUCKET_NAME
  )
}

function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

export function validateFile(
  buffer: Buffer,
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  if (!ACCEPTED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: 'UNSUPPORTED_FORMAT' }
  }
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: 'FILE_TOO_LARGE' }
  }
  return { valid: true }
}

async function processImage(buffer: Buffer): Promise<{ main: Buffer; thumbnail: Buffer }> {
  const mainBuffer = await sharp(buffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  const thumbnailBuffer = await sharp(buffer)
    .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer()

  return { main: mainBuffer, thumbnail: thumbnailBuffer }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SAFE_FOLDER_REGEX = /^[a-z0-9-]+$/i

function sanitizeFolderSegment(segment: string): string {
  // Accepte les UUID, et les préfixes comme "portfolio-{uuid}"
  // Rejette tout ce qui contient des caractères de traversée de chemin
  if (segment.includes('..') || segment.includes('/') || segment.includes('\\')) {
    throw new Error('INVALID_FOLDER_SEGMENT')
  }
  if (!SAFE_FOLDER_REGEX.test(segment)) {
    throw new Error('INVALID_FOLDER_SEGMENT')
  }
  return segment
}

export async function uploadOrderPhoto(
  buffer: Buffer,
  orderId: string
): Promise<UploadResult> {
  sanitizeFolderSegment(orderId) // Valider avant tout usage dans les chemins

  const { main, thumbnail } = await processImage(buffer)
  const filename = uuidv4()
  const key = `orders/${orderId}/${filename}.webp`
  const thumbnailKey = `orders/${orderId}/${filename}_thumb.webp`

  if (isR2Configured()) {
    // Upload vers Cloudflare R2
    const client = getR2Client()
    const bucket = process.env.R2_BUCKET_NAME!
    const publicUrl = process.env.R2_PUBLIC_URL!

    await Promise.all([
      client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: main,
        ContentType: 'image/webp',
      })),
      client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: 'image/webp',
      })),
    ])

    return {
      photoUrl: `${publicUrl}/${key}`,
      thumbnailUrl: `${publicUrl}/${thumbnailKey}`,
      key,
      thumbnailKey,
    }
  } else {
    // En production sans R2 configuré, le stockage de fichiers n'est pas disponible
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('STORAGE_NOT_CONFIGURED')
    }

    // Fallback filesystem local (développement uniquement)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'orders', orderId)
    await fs.mkdir(uploadDir, { recursive: true })

    await Promise.all([
      fs.writeFile(path.join(uploadDir, `${filename}.webp`), main),
      fs.writeFile(path.join(uploadDir, `${filename}_thumb.webp`), thumbnail),
    ])

    return {
      photoUrl: `/uploads/orders/${orderId}/${filename}.webp`,
      thumbnailUrl: `/uploads/orders/${orderId}/${filename}_thumb.webp`,
      key,
      thumbnailKey,
    }
  }
}

export async function uploadLogoImage(
  buffer: Buffer,
  stylistId: string
): Promise<{ logoUrl: string; key: string }> {
  sanitizeFolderSegment(stylistId)

  const processed = await sharp(buffer)
    .resize(300, 300, { fit: 'cover', position: 'center' })
    .webp({ quality: 90 })
    .toBuffer()

  const key = `logos/${stylistId}.webp`

  if (isR2Configured()) {
    const client = getR2Client()
    const bucket = process.env.R2_BUCKET_NAME!
    const publicUrl = process.env.R2_PUBLIC_URL!

    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: processed,
      ContentType: 'image/webp',
    }))

    return { logoUrl: `${publicUrl}/${key}`, key }
  } else {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('STORAGE_NOT_CONFIGURED')
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(path.join(uploadDir, `${stylistId}.webp`), processed)

    return { logoUrl: `/uploads/logos/${stylistId}.webp`, key }
  }
}

export async function deleteOrderPhoto(key: string, thumbnailKey: string): Promise<void> {
  if (isR2Configured()) {
    const client = getR2Client()
    const bucket = process.env.R2_BUCKET_NAME!

    await Promise.all([
      client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })),
      client.send(new DeleteObjectCommand({ Bucket: bucket, Key: thumbnailKey })),
    ])
  } else {
    // Fallback local : extraire le chemin depuis la key
    const basePath = path.join(process.cwd(), 'public')
    const mainPath = path.join(basePath, key.replace('orders/', 'uploads/orders/'))
    const thumbPath = path.join(basePath, thumbnailKey.replace('orders/', 'uploads/orders/'))

    await Promise.allSettled([fs.unlink(mainPath), fs.unlink(thumbPath)])
  }
}
