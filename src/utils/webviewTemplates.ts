export function simpleHtmlForContent(title: string, content: string) {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { font-family: sans-serif; padding: 16px; background: #1e1e1e; color: #d4d4d4; }
      pre { background: #252526; padding: 12px; border-radius: 6px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <h2>${title}</h2>
    <pre>${escape(content)}</pre>
  </body>
  </html>`;
}

function escape(text: string) {
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
