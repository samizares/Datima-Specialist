"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";
import { adminCampaignsPath } from "@/paths";

export type CampaignInput = {
  name: string;
  catchphrase: string;
  startDate: string;
  endDate: string;
};

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  catchphrase: z.string().min(1, "Catchphrase is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

const ensureAdminAccess = (user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createCampaign(input: CampaignInput): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = campaignSchema.parse(input);
    const campaign = await prisma.campaigns.create({ data });
    revalidatePath(adminCampaignsPath());
    return toActionState("SUCCESS", "Campaign added", undefined, campaign);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateCampaign(
  id: string,
  input: CampaignInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = campaignSchema.parse(input);
    const campaign = await prisma.campaigns.update({ where: { id }, data });
    revalidatePath(adminCampaignsPath());
    return toActionState("SUCCESS", "Campaign updated", undefined, campaign);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteCampaign(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const campaign = await prisma.campaigns.delete({ where: { id } });
    revalidatePath(adminCampaignsPath());
    return toActionState("SUCCESS", "Campaign deleted", undefined, campaign);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
