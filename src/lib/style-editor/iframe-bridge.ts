/**
 * Generates the bridge script that gets injected into the iframe HTML.
 * Starts dormant — only intercepts clicks and shows overlays after
 * receiving an ACTIVATE message from the parent.
 */
function bridgeScript(token: string): string {
  return `
(function() {
  var TOKEN = ${JSON.stringify(token)};
  var SOURCE = "style-editor";
  var active = false;
  var selected = null;
  var hoverOverlay = null;
  var selectOverlay = null;
  var editing = false;
  var originalText = "";

  function send(msg) {
    msg.source = SOURCE;
    msg.token = TOKEN;
    window.parent.postMessage(msg, "*");
  }

  function getCssPath(el) {
    var parts = [];
    var current = el;
    while (current && current !== document.documentElement) {
      if (current.id) {
        parts.unshift("#" + current.id);
        break;
      }
      var parent = current.parentElement;
      if (!parent) {
        parts.unshift(current.tagName.toLowerCase());
        break;
      }
      var siblings = Array.from(parent.children).filter(function(c) {
        return c.tagName === current.tagName;
      });
      if (siblings.length === 1) {
        parts.unshift(current.tagName.toLowerCase());
      } else {
        var index = siblings.indexOf(current) + 1;
        parts.unshift(current.tagName.toLowerCase() + ":nth-of-type(" + index + ")");
      }
      current = parent;
    }
    return parts.join(" > ");
  }

  function getStyles(el) {
    var styles = {};
    var computed = window.getComputedStyle(el);
    var props = [
      "color", "background-color", "font-family", "font-size",
      "font-weight", "text-align", "padding", "margin",
      "border-radius", "border-width", "border-color",
      "display", "line-height", "letter-spacing"
    ];
    props.forEach(function(p) { styles[p] = computed.getPropertyValue(p); });
    return styles;
  }

  function getAttributes(el) {
    var attrs = {};
    var tag = el.tagName.toLowerCase();
    if (tag === "a") {
      attrs.href = el.getAttribute("href") || "";
      attrs.target = el.getAttribute("target") || "";
    }
    if (tag === "img") {
      attrs.src = el.getAttribute("src") || "";
      attrs.alt = el.getAttribute("alt") || "";
    }
    return attrs;
  }

  function createOverlay(color, width) {
    var div = document.createElement("div");
    div.style.cssText = "position:absolute;pointer-events:none;z-index:99999;" +
      "border:" + width + "px solid " + color + ";border-radius:2px;transition:all 0.1s ease;display:none;";
    document.body.appendChild(div);
    return div;
  }

  function positionOverlay(overlay, el) {
    if (!overlay || !el) return;
    var rect = el.getBoundingClientRect();
    overlay.style.top = (rect.top + window.scrollY) + "px";
    overlay.style.left = (rect.left + window.scrollX) + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";
    overlay.style.display = "block";
  }

  function hideOverlay(overlay) {
    if (overlay) overlay.style.display = "none";
  }

  function removeOverlay(overlay) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function activate() {
    if (active) return;
    active = true;
    hoverOverlay = createOverlay("rgba(59,130,246,0.5)", 2);
    selectOverlay = createOverlay("rgba(59,130,246,1)", 2);
  }

  function deactivate() {
    if (!active) return;
    active = false;
    selected = null;
    editing = false;
    removeOverlay(hoverOverlay);
    removeOverlay(selectOverlay);
    hoverOverlay = null;
    selectOverlay = null;
  }

  document.addEventListener("mouseover", function(e) {
    if (!active || editing) return;
    var el = e.target;
    if (el === document.body || el === document.documentElement) {
      hideOverlay(hoverOverlay);
      send({ type: "ELEMENT_HOVERED", hover: null });
      return;
    }
    positionOverlay(hoverOverlay, el);
    var rect = el.getBoundingClientRect();
    send({
      type: "ELEMENT_HOVERED",
      hover: {
        cssPath: getCssPath(el),
        tagName: el.tagName.toLowerCase(),
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
      }
    });
  }, true);

  document.addEventListener("mouseout", function(e) {
    if (!active) return;
    if (!e.relatedTarget || e.relatedTarget === document) {
      hideOverlay(hoverOverlay);
      send({ type: "ELEMENT_HOVERED", hover: null });
    }
  }, true);

  document.addEventListener("click", function(e) {
    if (!active || editing) return;
    e.preventDefault();
    e.stopPropagation();
    var el = e.target;
    if (el === document.body || el === document.documentElement) return;
    selected = el;
    positionOverlay(selectOverlay, el);
    send({
      type: "ELEMENT_SELECTED",
      element: {
        cssPath: getCssPath(el),
        tagName: el.tagName.toLowerCase(),
        textContent: (el.textContent || "").trim().slice(0, 100),
        styles: getStyles(el),
        attributes: getAttributes(el)
      }
    });
  }, true);

  function finishEditing(el, revert) {
    if (!editing) return;
    if (revert) {
      el.textContent = originalText;
    }
    el.contentEditable = "false";
    editing = false;
    if (!revert) {
      send({
        type: "TEXT_CHANGED",
        cssPath: getCssPath(el),
        text: el.textContent || ""
      });
    }
    positionOverlay(selectOverlay, el);
  }

  document.addEventListener("dblclick", function(e) {
    if (!active) return;
    e.preventDefault();
    e.stopPropagation();
    var el = e.target;
    if (el === document.body || el === document.documentElement) return;
    if (el.children && el.children.length > 0) return;

    editing = true;
    originalText = el.textContent || "";
    el.contentEditable = "true";
    el.focus();

    hideOverlay(hoverOverlay);
    hideOverlay(selectOverlay);

    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    function onBlur() {
      cleanup();
      finishEditing(el, false);
    }

    function onKey(ke) {
      if (ke.key === "Escape") {
        ke.preventDefault();
        cleanup();
        finishEditing(el, true);
      } else if (ke.key === "Enter" && !ke.shiftKey) {
        ke.preventDefault();
        cleanup();
        finishEditing(el, false);
      }
    }

    function cleanup() {
      el.removeEventListener("blur", onBlur);
      el.removeEventListener("keydown", onKey);
    }

    el.addEventListener("blur", onBlur);
    el.addEventListener("keydown", onKey);
  }, true);

  window.addEventListener("message", function(e) {
    var data = e.data;
    if (!data || data.source !== SOURCE || data.token !== TOKEN) return;

    if (data.type === "ACTIVATE") {
      activate();
      return;
    }

    if (data.type === "DEACTIVATE") {
      deactivate();
      return;
    }

    if (data.type === "APPLY_STYLE") {
      var target = data.cssPath ? document.querySelector(data.cssPath) : null;
      if (target) {
        target.style.setProperty(data.property, data.value);
      }
    }

    if (data.type === "SELECT_ELEMENT") {
      var el = data.cssPath ? document.querySelector(data.cssPath) : null;
      if (el) {
        selected = el;
        positionOverlay(selectOverlay, el);
        send({
          type: "ELEMENT_SELECTED",
          element: {
            cssPath: getCssPath(el),
            tagName: el.tagName.toLowerCase(),
            textContent: (el.textContent || "").trim().slice(0, 100),
            styles: getStyles(el),
            attributes: getAttributes(el)
          }
        });
      }
    }

    if (data.type === "CLEAR_SELECTION") {
      selected = null;
      hideOverlay(selectOverlay);
    }

    if (data.type === "REPLACE_ELEMENT") {
      var target = data.cssPath ? document.querySelector(data.cssPath) : null;
      if (target && data.html) {
        var temp = document.createElement("template");
        temp.innerHTML = data.html.trim();
        var newEl = temp.content.firstElementChild;
        if (newEl) {
          target.replaceWith(newEl);
          selected = null;
          hideOverlay(selectOverlay);
        }
      }
    }
  });

  send({ type: "BRIDGE_READY" });
})();
`;
}

/**
 * Inject the editor bridge script into an HTML string before </body>.
 * Returns the modified HTML with the bridge script injected.
 */
export function injectEditorBridge(html: string, token: string): string {
  const script = `<script>${bridgeScript(token)}</script>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${script}\n</body>`);
  }

  if (html.includes("</html>")) {
    return html.replace("</html>", `${script}\n</html>`);
  }

  return html + script;
}
