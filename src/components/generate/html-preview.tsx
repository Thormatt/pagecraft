"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { injectEditorBridge } from "@/lib/style-editor/iframe-bridge";
import { isBridgeMessage, BRIDGE_MESSAGE_PREFIX } from "@/lib/style-editor/protocol";
import type { ElementInfo, HoverInfo } from "@/types/style-editor";
import type { IframeToParentMessage } from "@/lib/style-editor/protocol";

interface HtmlPreviewProps {
  html: string;
  previewHtml?: string;
  className?: string;
  editorMode?: boolean;
  onElementSelected?: (element: ElementInfo) => void;
  onElementHovered?: (hover: HoverInfo | null) => void;
  onTextChanged?: (cssPath: string, text: string) => void;
}

export interface HtmlPreviewHandle {
  applyStyle: (cssPath: string, property: string, value: string) => void;
  selectElement: (cssPath: string) => void;
  clearSelection: () => void;
}

function generateToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const HtmlPreview = forwardRef<HtmlPreviewHandle, HtmlPreviewProps>(
  function HtmlPreview(
    { html, previewHtml, className, editorMode, onElementSelected, onElementHovered, onTextChanged },
    ref
  ) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const tokenRef = useRef(generateToken());
    const [bridgeReady, setBridgeReady] = useState(false);

    const postToIframe = useCallback(
      (message: Record<string, unknown>) => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) return;
        iframe.contentWindow.postMessage(
          { source: BRIDGE_MESSAGE_PREFIX, token: tokenRef.current, ...message },
          "*"
        );
      },
      []
    );

    useImperativeHandle(
      ref,
      () => ({
        applyStyle(cssPath: string, property: string, value: string) {
          postToIframe({ type: "APPLY_STYLE", cssPath, property, value });
        },
        selectElement(cssPath: string) {
          postToIframe({ type: "SELECT_ELEMENT", cssPath });
        },
        clearSelection() {
          postToIframe({ type: "CLEAR_SELECTION" });
        },
      }),
      [postToIframe]
    );

    // Listen for messages from the iframe bridge
    useEffect(() => {
      if (!editorMode) return;

      const handler = (e: MessageEvent) => {
        if (!isBridgeMessage(e.data, tokenRef.current)) return;
        const data = e.data as { type: string } & IframeToParentMessage;

        switch (data.type) {
          case "BRIDGE_READY":
            setBridgeReady(true);
            break;
          case "ELEMENT_SELECTED":
            if ("element" in data) onElementSelected?.(data.element);
            break;
          case "ELEMENT_HOVERED":
            if ("hover" in data) onElementHovered?.(data.hover);
            break;
          case "TEXT_CHANGED":
            if ("cssPath" in data && "text" in data) onTextChanged?.(data.cssPath, data.text);
            break;
        }
      };

      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, [editorMode, onElementSelected, onElementHovered, onTextChanged]);

    // Load HTML into iframe via Blob URL
    // Use previewHtml (which doesn't change on style-only edits) to avoid reloads
    const sourceHtml = previewHtml ?? html;

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      setBridgeReady(false);
      tokenRef.current = generateToken();

      const finalHtml = editorMode
        ? injectEditorBridge(sourceHtml, tokenRef.current)
        : sourceHtml;

      const blob = new Blob([finalHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      iframe.src = url;

      return () => URL.revokeObjectURL(url);
    }, [sourceHtml, editorMode]);

    return (
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        className={className}
        title="HTML Preview"
        style={editorMode ? { cursor: "crosshair" } : undefined}
      />
    );
  }
);
