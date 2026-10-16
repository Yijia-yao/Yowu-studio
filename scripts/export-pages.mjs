import { spawn } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";

const base = "/Yowu-studio";
const routes = ["/", "/studio", "/about", "/collections", "/collections/first-encounter", "/stories", "/contact", ...Array.from({length: 6}, (_, i) => `/pieces/0${i + 1}`)];
const node = process.execPath;
const server = spawn(node, ["node_modules/vinext/dist/cli.js", "start", "--port", "4173"], { stdio: "inherit", env: process.env });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch("http://localhost:4173/")).ok) break; } catch {}
    await sleep(500);
  }
  await rm("pages-dist", { recursive: true, force: true });
  await mkdir("pages-dist", { recursive: true });
  await cp("dist/client", "pages-dist", { recursive: true });
  const patchCss = async dir => {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const file = `${dir}/${item.name}`;
      if (item.isDirectory()) await patchCss(file);
      else if (file.endsWith(".css")) {
        const css = (await readFile(file, "utf8"))
          .replaceAll("url(/yowu-", `url(${base}/yowu-`)
          .replaceAll("url(/first-", `url(${base}/first-`);
        await writeFile(file, css);
      }
    }
  };
  await patchCss("pages-dist/_next");
  const prefix = html => html
    .replaceAll('href="/_next/', `href="${base}/_next/`)
    .replaceAll('src="/_next/', `src="${base}/_next/`)
    .replaceAll('href="/favicon', `href="${base}/favicon`)
    .replaceAll('href="/file', `href="${base}/file`)
    .replaceAll('href="/globe', `href="${base}/globe`)
    .replaceAll('href="/window', `href="${base}/window`)
    .replaceAll('src="/yowu-', `src="${base}/yowu-`)
    .replaceAll('src="/first-', `src="${base}/first-`)
    .replace("</head>", `<script>document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.getAttribute('href')?.startsWith('/')){e.preventDefault();location.href='${base}'+a.getAttribute('href')}})</script></head>`);
  for (const route of routes) {
    const html = prefix(await (await fetch(`http://localhost:4173${route}`)).text());
    const dir = route === "/" ? "pages-dist" : `pages-dist${route}`;
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/index.html`, html);
  }
  await cp("pages-dist/index.html", "pages-dist/404.html");
  const manifest = JSON.parse(await readFile("dist/client/.vite/manifest.json", "utf8"));
  void manifest;
} finally { server.kill(); }
