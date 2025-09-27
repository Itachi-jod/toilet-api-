import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { avatar } = req.query;

  if (!avatar) {
    return res.status(400).json({ error: "Missing avatar URL. Use ?avatar=URL" });
  }

  try {
    // Load background template
    const template = await loadImage("https://i.imgur.com/yKIu3lu.jpeg");

    // Load avatar
    const avResp = await axios.get(avatar, { responseType: "arraybuffer" });
    const avone = await loadImage(Buffer.from(avResp.data));

    // Create canvas same as template size
    const canvas = createCanvas(1080, 1350);
    const ctx = canvas.getContext("2d");

    // Draw template background
    ctx.drawImage(template, 0, 0, 1080, 1350);

    // Draw circular avatar
    const drawCircleImage = (img, x, y, width, height) => {
      const size = Math.min(width, height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, width, height);
      ctx.restore();
    };

    // Place single avatar (example position & size)
    drawCircleImage(avone, 300, 660, 450, 450);

    // Send final image
    res.setHeader("Content-Type", "image/png");
    const buffer = canvas.toBuffer("image/png");
    return res.send(buffer);

  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
}
