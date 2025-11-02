// deno-lint-ignore-file ban-ts-comment no-explicit-any
// Setup DOM environment for Deno
import { DOMParser, Element } from "@b-fuze/deno-dom";

// Create a basic DOM environment
const document = new DOMParser().parseFromString(
  `<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>`,
  "text/html"
) as any;

// Create a window-like object
const window: any = {
  document,
  navigator: {
    userAgent: "Deno",
  },
  requestAnimationFrame: (cb: any) => setTimeout(cb, 0),
  cancelAnimationFrame: (id: any) => clearTimeout(id),
  requestIdleCallback: (cb: any) => setTimeout(cb, 0),
  cancelIdleCallback: (id: any) => clearTimeout(id),
  getComputedStyle: () => ({
    getPropertyValue: () => "",
  }),
  event: undefined,
  Element,
  HTMLElement: Element,
  HTMLIFrameElement: Element,
  SVGElement: Element,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
  location: {
    href: "http://localhost/",
    origin: "http://localhost",
    protocol: "http:",
    host: "localhost",
    hostname: "localhost",
    port: "",
    pathname: "/",
    search: "",
    hash: "",
  },
  // Mock for React's activeElement check
  Document: document.constructor,
  Node: Element,
};

// Link window and document
document.defaultView = window;
window.window = window;

// Add missing DOM methods
if (Element && !Element.prototype.matches) {
  Element.prototype.matches = function (_selector: string) {
    return false;
  };
}

// Set up globals
// @ts-ignore
globalThis.document = document;
// @ts-ignore
globalThis.window = window;
// @ts-ignore
globalThis.navigator = window.navigator;
// @ts-ignore
globalThis.requestAnimationFrame = window.requestAnimationFrame;
// @ts-ignore
globalThis.cancelAnimationFrame = window.cancelAnimationFrame;
// @ts-ignore
globalThis.Element = Element;
// @ts-ignore
globalThis.HTMLElement = Element;
// @ts-ignore
globalThis.HTMLIFrameElement = Element;
// @ts-ignore
globalThis.SVGElement = Element;
// @ts-ignore
globalThis.Node = Element;
