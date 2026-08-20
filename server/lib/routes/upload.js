import { put } from "@vercel/blob";
import { readJson, sendJson, handleError } from "../http.js";
import { requireSession } from "../auth.js";

function isBlobConfigured() {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function handle(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed." });
  try {
    await requireSession(req);
    if (!isBlobConfigured()) {
      throw Object.assign(
        new Error(
          "Image uploads are not configured. In Vercel, open your project → Storage → Create → Blob, connect the store to Production and Preview, then redeploy."
        ),
        { status: 503 }
      );
    }

    const body = await readJson(req);
    const dataUrl = body.dataUrl || "";
    const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (!match) throw Object.assign(new Error("Invalid image data."), { status: 400 });

    const contentType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 4 * 1024 * 1024) {
      throw Object.assign(new Error("Image must be under 4 MB."), { status: 400 });
    }

    const ext = contentType.includes("png") ? "png" : "jpg";
    const blob = await put(`guides/${Date.now()}.${ext}`, buffer, {
      access: "public",
      contentType
    });

    sendJson(res, 201, { url: blob.url, id: blob.pathname });
  } catch (err) {
    handleError(res, err);
  }
}
