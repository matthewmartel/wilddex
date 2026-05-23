"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNewlyCompletedQuests } from "@/lib/supabase/queries";
import type { SightingActionState } from "@/lib/sightings/types";


const SIGHTING_PHOTOS_BUCKET = "sighting-photos";
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const MAX_TEXT_LENGTH = 160;
const MAX_NOTES_LENGTH = 500;

const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function textField(formData: FormData, key: string, max = MAX_TEXT_LENGTH) {
  const value = String(formData.get(key) ?? "").trim();
  return value.slice(0, max);
}

function getPhotoExtension(photo: File): string | null {
  const mimeExtension = PHOTO_EXTENSIONS[photo.type];
  if (mimeExtension) return mimeExtension;

  const match = photo.name.toLowerCase().match(/\.([a-z0-9]+)$/);
  const extension = match?.[1];

  if (!extension) return null;
  return ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
    ? extension.replace("jpeg", "jpg")
    : null;
}

function errorState(message: string): SightingActionState {
  return { status: "error", message };
}

export async function logSighting(
  _prevState: SightingActionState,
  formData: FormData
): Promise<SightingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorState("Log in before adding a field sighting.");
  }

  const speciesId = textField(formData, "species_id", 80);
  const locationName = textField(formData, "location_name");
  const region = textField(formData, "region");
  const country = textField(formData, "country");
  const notes = textField(formData, "notes", MAX_NOTES_LENGTH);
  const photo = formData.get("photo");
  const rawLat = formData.get("latitude");
  const rawLng = formData.get("longitude");
  const latitude =
    rawLat && String(rawLat).trim() !== ""
      ? parseFloat(String(rawLat))
      : null;
  const longitude =
    rawLng && String(rawLng).trim() !== ""
      ? parseFloat(String(rawLng))
      : null;
  const gpsVerified =
    formData.get("gps_verified") === "true" &&
    latitude != null &&
    longitude != null;

  if (!speciesId) return errorState("Pick the species you spotted.");
  if (!locationName) return errorState("Add a location name.");
  if (!region) return errorState("Add a region.");
  if (!country) return errorState("Add a country.");

  if (!(photo instanceof File) || photo.size === 0) {
    return errorState("Choose a sighting photo.");
  }

  if (photo.size > MAX_PHOTO_BYTES) {
    return errorState("Photo is too large. Keep it under 6 MB.");
  }

  const extension = getPhotoExtension(photo);
  if (!extension) {
    return errorState("Use a JPG, PNG, WebP, or GIF photo.");
  }

  const { data: species, error: speciesError } = await supabase
    .from("species")
    .select("id, dex_number")
    .eq("id", speciesId)
    .single();

  if (speciesError || !species) {
    return errorState("That species was not found in the WildDex.");
  }

  const sightingId = randomUUID();
  const photoUrl = `${user.id}/${sightingId}.${extension}`;
  const contentType =
    photo.type || (extension === "jpg" ? "image/jpeg" : `image/${extension}`);

  const { error: uploadError } = await supabase.storage
    .from(SIGHTING_PHOTOS_BUCKET)
    .upload(photoUrl, photo, {
      cacheControl: "3600",
      contentType,
      upsert: false,
    });

  if (uploadError) {
    return errorState(`Photo upload failed: ${uploadError.message}`);
  }

  const { error: sightingError } = await supabase.from("sightings").insert({
    id: sightingId,
    user_id: user.id,
    species_id: species.id,
    photo_url: photoUrl,
    location_name: locationName,
    region,
    country,
    notes: notes || null,
    latitude,
    longitude,
    gps_verified: gpsVerified,
  });

  if (sightingError) {
    await supabase.storage.from(SIGHTING_PHOTOS_BUCKET).remove([photoUrl]);
    return errorState(`Sighting save failed: ${sightingError.message}`);
  }

  const { error: dexError } = await supabase
    .from("user_dex_entries")
    .upsert(
      {
        user_id: user.id,
        species_id: species.id,
        unlocked_at: new Date().toISOString(),
      },
      { onConflict: "user_id,species_id", ignoreDuplicates: true }
    );

  if (dexError) {
    return errorState(`Sighting saved, but unlock failed: ${dexError.message}`);
  }

  const newlyCompleted = await getNewlyCompletedQuests();
  if (newlyCompleted.length > 0) {
    await supabase.from("user_quest_completions").insert(
      newlyCompleted.map((q) => ({ user_id: user.id, quest_id: q.quest.id }))
    );
  }

  revalidatePath("/");
  revalidatePath("/dex");
  revalidatePath("/profile");
  revalidatePath("/quests");
  revalidatePath("/animal/[id]", "page");

  const questQuery =
    newlyCompleted.length > 0
      ? `&quest=${newlyCompleted.map((q) => q.quest.id).join(",")}`
      : "";

  redirect(`/animal/${species.dex_number}?logged=1${questQuery}`);
}

export async function updateSighting(
  _prevState: SightingActionState,
  formData: FormData
): Promise<SightingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return errorState("You must be logged in.");

  const sightingId = String(formData.get("sighting_id") ?? "").trim();
  if (!sightingId) return errorState("Missing sighting ID.");

  const locationName = textField(formData, "location_name");
  const region = textField(formData, "region");
  const country = textField(formData, "country");
  const notes = textField(formData, "notes", MAX_NOTES_LENGTH);
  const isPublic = formData.get("is_public") === "on";

  if (!locationName) return errorState("Location name is required.");
  if (!region) return errorState("Continent is required.");
  if (!country) return errorState("Country is required.");

  const { error } = await supabase
    .from("sightings")
    .update({
      location_name: locationName,
      region,
      country,
      notes: notes || null,
      is_public: isPublic,
    })
    .eq("id", sightingId)
    .eq("user_id", user.id);

  if (error) return errorState(`Update failed: ${error.message}`);

  revalidatePath("/profile");
  revalidatePath("/map");
  revalidatePath("/animal/[id]", "page");

  return { status: "success", message: "Sighting updated." };
}

export async function deleteSighting(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const sightingId = String(formData.get("sighting_id") ?? "").trim();
  const dexNumber = String(formData.get("dex_number") ?? "").trim();
  if (!sightingId) return;

  const { data: sighting } = await supabase
    .from("sightings")
    .select("photo_url")
    .eq("id", sightingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sighting) return;

  await supabase.from("sightings").delete().eq("id", sightingId).eq("user_id", user.id);

  if (sighting.photo_url) {
    await supabase.storage.from(SIGHTING_PHOTOS_BUCKET).remove([sighting.photo_url]);
  }

  revalidatePath("/");
  revalidatePath("/dex");
  revalidatePath("/profile");
  revalidatePath("/map");
  revalidatePath("/animal/[id]", "page");

  redirect(`/animal/${dexNumber}`);
}
