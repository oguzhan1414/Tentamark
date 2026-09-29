import { renderHtmlToImage } from "../renderHtmlToImage";
import { notificationCardDimensions, type NotificationCardProps } from "./types";
import { pickNotificationVariant } from "./registry";

export async function renderNotificationCard(props: NotificationCardProps, options?: { variantKey?: string }): Promise<Buffer> {
  const dimensions = notificationCardDimensions(props.format);
  const buildHtml = pickNotificationVariant(options?.variantKey);
  return renderHtmlToImage(buildHtml(props), dimensions);
}
