import { createWorker } from "tesseract.js";
import sharp from "sharp";

export async function extractTextFromImage(imageBuffer) {
  let preprocessed;
  try {
    preprocessed = await sharp(imageBuffer)
      .grayscale()
      .normalise()
      .sharpen()
      .toBuffer();
  } catch (err) {
    console.warn("Image preprocessing failed, using original");
    preprocessed = imageBuffer;
  }

  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(preprocessed);
    const text = data.text.trim();
    if (!text) {
      throw new Error("OCR produced no text output");
    }
    return cleanOcrText(text);
  } finally {
    await worker.terminate();
  }
}

function cleanOcrText(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .replace(/[^\x20-\x7E\n]/g, "")
    .replace(/\n{3,}/g, "\n\n");
}
