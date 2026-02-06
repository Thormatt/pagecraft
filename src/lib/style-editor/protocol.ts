import type { ElementInfo, HoverInfo } from "@/types/style-editor";

// Messages sent from parent to iframe
export type ParentToIframeMessage =
  | { type: "APPLY_STYLE"; cssPath: string; property: string; value: string }
  | { type: "SELECT_ELEMENT"; cssPath: string }
  | { type: "CLEAR_SELECTION" };

// Messages sent from iframe to parent
export type IframeToParentMessage =
  | { type: "ELEMENT_SELECTED"; element: ElementInfo }
  | { type: "ELEMENT_HOVERED"; hover: HoverInfo | null }
  | { type: "TEXT_CHANGED"; cssPath: string; text: string }
  | { type: "BRIDGE_READY" };

export const BRIDGE_MESSAGE_PREFIX = "style-editor";

export function createBridgeMessage<T extends ParentToIframeMessage | IframeToParentMessage>(
  token: string,
  message: T
): { source: string; token: string } & T {
  return { source: BRIDGE_MESSAGE_PREFIX, token, ...message };
}

export function isBridgeMessage(
  data: unknown,
  token: string
): data is { source: string; token: string; type: string } {
  if (typeof data !== "object" || data === null) return false;
  const msg = data as Record<string, unknown>;
  return msg.source === BRIDGE_MESSAGE_PREFIX && msg.token === token;
}
