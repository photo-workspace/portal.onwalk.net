import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);
const IMAGE_CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
const LOCAL_MEDIA_ROOT = path.join(process.cwd(), "public", "images");

function notFoundResponse(): Response {
  return new Response(null, {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isValidExtension(filename: string): boolean {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === filename.length - 1) {
    return false;
  }

  return IMAGE_EXTENSIONS.has(filename.slice(dotIndex).toLowerCase());
}

function buildKey(slug: string[]): string | null {
  if (slug.length === 0) {
    return null;
  }

  const filename = slug[slug.length - 1];
  if (!isValidExtension(filename)) {
    return null;
  }

  // Allow arbitrary folder structure: images/a/b/c/.../file.ext
  return `images/${slug.join("/")}`;
}

function buildLocalPath(slug: string[]): string | null {
  if (slug.length === 0) {
    return null;
  }

  const filename = slug[slug.length - 1];
  if (!isValidExtension(filename)) {
    return null;
  }

  return path.join(LOCAL_MEDIA_ROOT, ...slug);
}

function getContentType(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  return IMAGE_CONTENT_TYPES[extension] ?? "application/octet-stream";
}

function redirectResponse(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Cache-Control": IMMUTABLE_CACHE,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const key = buildKey(slug);
  if (!key) {
    return notFoundResponse();
  }

  const localPath = buildLocalPath(slug);
  if (localPath) {
    try {
      const data = await fs.readFile(localPath);
      const body = new Uint8Array(data);
      return new Response(body, {
        status: 200,
        headers: {
          "Cache-Control": IMMUTABLE_CACHE,
          "Content-Type": getContentType(localPath),
        },
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  const baseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!baseUrl) {
    return notFoundResponse();
  }

  const redirectUrl = `${baseUrl.replace(/\/+$/, "")}/${key}`;
  return redirectResponse(redirectUrl);
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  return GET(request, context);
}
