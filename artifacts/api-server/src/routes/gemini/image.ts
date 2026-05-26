import { Router, type IRouter } from "express";
import { generateImage } from "@workspace/integrations-gemini-ai/image";
import { GenerateGeminiImageBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/generate-image", async (req, res) => {
  try {
    const body = GenerateGeminiImageBody.parse(req.body);
    const { b64_json, mimeType } = await generateImage(body.prompt);
    res.json({ b64_json, mimeType });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

export default router;
