import prisma from "@/lib/prisma";

export async function getIdChannel({
  id,
  mattermost_id,
}: {
  id: number;
  mattermost_id: string;
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_API_MATTERMOST_URL}/api/v4/channels/direct`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_API_MATTERMOST_TOKEN}`,
        },
        body: JSON.stringify([
          process.env.NEXT_MATTERMOST_TEAM_ID,
          mattermost_id,
        ]),
      }
    );

    if (!response.ok) {
      return "unavailable";
    }

    const data = await response.json();
    // Update user with new channel ID
    await prisma.user.update({
      where: { id: id },
      data: { mattermost_channel_id: data.id },
    });
    return data.id;
  } catch {
    return "unavailable";
  }
}

export async function sendBotMessage(
  id: number,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: {
          equals: id,
        },
      },
    });

    if (!user || !user.mattermost_id) {
      return { success: false, error: "User or channel ID not found" };
    }

    let channelId = user.mattermost_channel_id;

    if (!channelId) {
      const channelIdResponse = await getIdChannel({
        id: user.id,
        mattermost_id: user.mattermost_id,
      });

      if (channelIdResponse === "unavailable") {
        return { success: false, error: "Failed to get channel ID" };
      }

      channelId = channelIdResponse;
    }

    const response = await fetch(
      `${process.env.NEXT_API_MATTERMOST_URL}/api/v4/posts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_API_MATTERMOST_TOKEN}`,
        },
        body: JSON.stringify({
          channel_id: channelId,
          message: message,
        }),
      }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to send message" };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
