const fs = require("fs");
const path = require("path");

const METRIKA_CODE = `... твой код Метрики ...`;

const outDir = path.join(__dirname, "..", "out");

function insertMetrikaRecursive(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      insertMetrikaRecursive(fullPath); // рекурсия в подпапку
    } else if (stat.isFile() && item.endsWith(".html")) {
      let content = fs.readFileSync(fullPath, "utf8");
      if (!content.includes("mc.yandex.ru")) {
        content = content.replace("</head>", `${METRIKA_CODE}\n</head>`);
        fs.writeFileSync(fullPath, content, "utf8");
        console.log(`✅ Метрика вставлена в ${path.relative(outDir, fullPath)}`);
      }
    }
  }
}

insertMetrikaRecursive(outDir);
