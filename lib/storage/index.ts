import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

function useS3(): boolean {
  return Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID);
}

/** Vercel has no persistent disk — uploads require S3/R2 in production. */
export function isCloudStorageConfigured(): boolean {
  return useS3();
}

export function assertUploadStorageAvailable(): void {
  if (process.env.VERCEL === "1" && !useS3()) {
    throw new Error(
      "Document upload is not configured for this hosted environment. " +
        "Ask your administrator to set S3/R2 environment variables. " +
        "See /help for details.",
    );
  }
}

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION ?? "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    ...(process.env.S3_ENDPOINT
      ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
      : {}),
  });
}

export async function storeFile(
  file: Buffer,
  fileName: string,
  mimeType: string,
  caseId: string,
): Promise<{ fileKey: string; fileSize: number }> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileKey = `cases/${caseId}/${uuidv4()}-${safeName}`;

  if (useS3()) {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: fileKey,
        Body: file,
        ContentType: mimeType,
        ServerSideEncryption: "AES256",
      }),
    );
  } else {
    const fullPath = path.join(UPLOAD_DIR, fileKey);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file);
  }

  return { fileKey, fileSize: file.length };
}

export async function readStoredFile(fileKey: string): Promise<Buffer> {
  if (useS3()) {
    const client = getS3Client();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: fileKey,
      }),
    );
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) throw new Error("Failed to read file from S3");
    return Buffer.from(bytes);
  }

  const fullPath = path.join(UPLOAD_DIR, fileKey);
  return readFile(fullPath);
}

export async function getDownloadUrl(fileKey: string): Promise<string> {
  if (useS3()) {
    const client = getS3Client();
    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: fileKey,
      }),
      { expiresIn: 3600 },
    );
  }

  return `/api/files/${encodeURIComponent(fileKey)}`;
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
