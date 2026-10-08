// Whole-site translation powered by the Google Website Translator widget.
// The chosen language is stored in the `googtrans` cookie, which the widget reads on load.

const GOOGLE_CODES: Record<string, string> = { zh: "zh-CN", he: "iw", jv: "jw" };

function setCookie(value: string | null) {
  const hosts = ["", window.location.hostname, `.${window.location.hostname.split(".").slice(-2).join(".")}`];
  for (const host of hosts) {
    const domain = host ? `;domain=${host}` : "";
    document.cookie = value
      ? `googtrans=${value};path=/${domain}`
      : `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domain}`;
  }
}

export function applySiteLanguage(code: string) {
  if (code === "en") setCookie(null);
  else setCookie(`/en/${GOOGLE_CODES[code] ?? code}`);
  window.location.reload();
}

// Prevent React crashes when the translator replaces text nodes.
function patchDom() {
  const w = window as unknown as { __ppPatched?: boolean };
  if (w.__ppPatched) return;
  w.__ppPatched = true;
  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
}

export function initSiteTranslation(code: string) {
  if (code === "en" || document.getElementById("google-translate-script")) return;
  patchDom();
  const wanted = `/en/${GOOGLE_CODES[code] ?? code}`;
  if (!document.cookie.includes(`googtrans=${wanted}`)) setCookie(wanted);
  if (!document.getElementById("google_translate_element")) {
    const el = document.createElement("div");
    el.id = "google_translate_element";
    el.style.display = "none";
    document.body.appendChild(el);
  }
  const g = window as unknown as Record<string, unknown>;
  g["googleTranslateElementInit"] = () => {
    const google = g["google"] as { translate: { TranslateElement: new (o: object, id: string) => unknown } };
    new google.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false }, "google_translate_element");
  };
  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}
