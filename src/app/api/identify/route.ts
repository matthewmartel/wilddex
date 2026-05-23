import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getSpeciesOptions } from "@/lib/supabase/queries";

const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const VALID_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type ValidMediaType = (typeof VALID_TYPES)[number];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const photo = formData.get("photo");

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Photo too large (max 6 MB)" }, { status: 400 });
  }

  const mediaType = photo.type as ValidMediaType;
  if (!VALID_TYPES.includes(mediaType)) {
    return NextResponse.json({ error: "Use a JPG, PNG, WebP, or GIF photo" }, { status: 400 });
  }

  const [speciesOptions, photoBuffer] = await Promise.all([
    getSpeciesOptions(),
    photo.arrayBuffer(),
  ]);

  const base64 = Buffer.from(photoBuffer).toString("base64");

  const speciesList = speciesOptions
    .map(
      (s) =>
        `id:${s.id} | #${s.number} ${s.name} | ${s.type} | ${s.rarity} | ${s.region}`
    )
    .join("\n");

  const client = new Anthropic();

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `You are a wildlife identification expert for the WildDex app. Examine the animal in this photo and match it to the species list below.

Species list:
${speciesList}

Return a JSON array of up to 3 most likely matches. Use ONLY the exact UUID that appears after "id:" in the species list — do not modify or shorten it.
Format: [{"species_id":"<exact-uuid-from-list>","confidence":<0-100>},...]
Rules:
- confidence is 0-100 (integer)
- sort by confidence descending
- omit any match below confidence 10
- if nothing matches, return []
Return ONLY the raw JSON array — no markdown, no explanation, no code fences.`,
            },
          ],
        },
      ],
    });

    let responseText =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Strip markdown code fences if present
    responseText = responseText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let rawCandidates: { species_id: string; confidence: number }[] = [];
    try {
      rawCandidates = JSON.parse(responseText);
    } catch {
      console.error("[/api/identify] JSON parse failed:", responseText);
      return NextResponse.json({ candidates: [] });
    }

    if (!Array.isArray(rawCandidates)) {
      return NextResponse.json({ candidates: [] });
    }

    const speciesMap = new Map(speciesOptions.map((s) => [s.id, s]));

    const candidates = rawCandidates
      .filter(
        (c) =>
          c &&
          typeof c.species_id === "string" &&
          speciesMap.has(c.species_id) &&
          typeof c.confidence === "number"
      )
      .slice(0, 3)
      .map((c) => {
        const s = speciesMap.get(c.species_id)!;
        return {
          species_id: s.id,
          name: s.name,
          dex_number: s.dexNumber,
          number: s.number,
          confidence: Math.min(100, Math.max(0, Math.round(c.confidence))),
          sprite: s.sprite,
          type: s.type,
          rarity: s.rarity,
        };
      });

    return NextResponse.json({ candidates });
  } catch (err) {
    console.error("[/api/identify]", err);
    return NextResponse.json({ error: "Identification failed" }, { status: 500 });
  }
}
