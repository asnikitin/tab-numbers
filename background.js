function getTitle({ index, title, total }) {
  const separator = '] ';
  const num = index + 1;
  const nextTitle = title.includes(separator) ? title
    .split(separator)
    .slice(1)
    .join('') : title;
  if (total > 9) {
    if (num === total) return `9${separator}${nextTitle}`;
    if (num > 8) return nextTitle;
  }
  return `${num}${separator}${nextTitle}`;
}

function isValid(url) {
  let valid = true;
  const prefixes = ['chrome://', 'about:', 'view-source:'];
  prefixes.forEach((item) => {
    if (url.includes(item)) valid = false;
  });
  return valid;
}

function run() {
  chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
    const total = tabs.length;
    tabs.forEach((item) => {
      const { id, url } = item;
      if (isValid(url)) {
        chrome.tabs.executeScript(id, {
          code: `chrome.runtime.sendMessage(${JSON.stringify({
            ...item,
            total,
          })})`,
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((data) => {
  const { id, ...rest } = data;
  chrome.tabs.executeScript(id, { code: `document.title = ${JSON.stringify(getTitle(rest))}` });
});

chrome.tabs.onMoved.addListener(() => {
  run();
});

chrome.tabs.onUpdated.addListener(() => {
  run();
});
