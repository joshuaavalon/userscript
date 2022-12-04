// ==UserScript==
// @name         uma-db helper
// @namespace    https://github.com/joshuaavalon/userscript
// @version      1.0
// @description  Highlight factors and bypass adblock detection
// @author       Joshua Avalon
// @license      MIT
// @match        https://uma.pure-db.com/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @run-at document-end
// @grant GM_addStyle
// ==/UserScript==

const cssText = `
.factor-ex {
  padding: 2px 4px;
  --borderWidth: 2px;
  position: relative;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  transition: all 300ms ease;
  text-decoration: none;
  background-color: black !important;
  font-family: 'Noto Sans JP', sans-serif;
  opacity: .7;
}

.non-factor {
  opacity: .5;
}

div.row > div.col-10 > div {
  margin: 5px 0;
}

.factor {
  display: inline-block;
  margin: 2px 5px !important;
}
`;

GM_addStyle(cssText);

const extract = (node: Element): string => {
  const text = Array.from(node.childNodes).find(
    child => child.nodeType === Node.TEXT_NODE
  );
  return text?.textContent?.trim() ?? "";
};

const updateRel = (): void =>
  document.querySelectorAll("span.factor").forEach(e => {
    const text = extract(e.children[0]);
    if (text.includes("代表")) {
      e.classList.remove("non-factor");
      e.classList.add("factor-ex");
    } else {
      e.classList.remove("factor-ex");
      e.classList.add("non-factor");
    }
  });

const config = { childList: true, subtree: true };
const observer = new MutationObserver(_.throttle(updateRel, 200));

const timeout = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

// Intercept fetch to prevent adblock detect
function interceptFetch(): void {
  const fetch = unsafeWindow.fetch;
  unsafeWindow.fetch = function (...args) {
    if (args.length !== 2) {
      return Promise.resolve(fetch.apply(unsafeWindow, args));
    }
    const [url, opts] = args;
    const body = opts?.body;
    if (url !== "/api/search" || !opts || !_.isString(body)) {
      return Promise.resolve(fetch.apply(unsafeWindow, args));
    }
    const json = JSON.parse(body);
    json.search_info.ads_blocked = false;
    opts.body = JSON.stringify(json);
    return Promise.resolve(fetch.apply(unsafeWindow, args));
  };
}

async function main(): Promise<void> {
  interceptFetch();

  let targetNode = document.querySelector("table");
  while (!targetNode) {
    await timeout(100);
    targetNode = document.querySelector("table");
  }
  observer.observe(targetNode, config);
}

main();
