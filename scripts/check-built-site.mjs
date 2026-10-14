import { parse } from 'parse5';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? filesIn(path.join(directory, entry.name))
          : [path.join(directory, entry.name)],
      ),
    )
  ).flat();
}

export async function checkBuiltSite(directory) {
  const root = path.resolve(directory);
  const files = await filesIn(root);
  const failures = [];
  const origin = 'https://ulp.ugr.es';
  async function check(value, source) {
    if (!value || value.startsWith('#')) return;
    let url;
    try {
      url = new URL(
        value,
        new URL(
          path.relative(root, source).split(path.sep).join('/'),
          origin + '/',
        ),
      );
    } catch {
      failures.push(`${path.relative(root, source)}: URL inválida ${value}`);
      return;
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin)
      return;
    let target;
    try {
      target = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    } catch {
      failures.push(`${source}: URL inválida ${value}`);
      return;
    }
    if (target !== root && !target.startsWith(root + path.sep)) {
      failures.push(`${source}: ruta fuera de dist: ${value}`);
      return;
    }
    const info = await stat(target).catch(() => null);
    if (info?.isDirectory()) target = path.join(target, 'index.html');
    const exists = await stat(target)
      .then((item) => item.isFile())
      .catch(() => false);
    if (!exists) failures.push(`${path.relative(root, source)} → ${value}`);
  }
  for (const file of files.filter((file) => file.endsWith('.html'))) {
    const pending = [];
    function visit(node) {
      const attrs = Object.fromEntries(
        (node.attrs ?? []).map((attr) => [attr.name, attr.value]),
      );
      if (node.tagName === 'img' && !attrs.src)
        failures.push(`${path.relative(root, file)}: imagen sin src`);
      if (['a', 'link'].includes(node.tagName))
        pending.push(check(attrs.href, file));
      if (['img', 'script', 'source', 'iframe'].includes(node.tagName))
        pending.push(check(attrs.src, file));
      if (attrs.srcset && !attrs.srcset.startsWith('data:'))
        for (const candidate of attrs.srcset.split(','))
          pending.push(check(candidate.trim().split(/\s+/)[0], file));
      if (
        node.tagName === 'meta' &&
        attrs['http-equiv']?.toLowerCase() === 'refresh'
      ) {
        const destination = attrs.content
          ?.match(/url=(.*)$/i)?.[1]
          ?.replace(/^['"]|['"]$/g, '');
        if (destination) pending.push(check(destination, file));
      }
      for (const child of node.childNodes ?? []) visit(child);
    }
    visit(parse(await readFile(file, 'utf8')));
    await Promise.all(pending);
  }
  return [...new Set(failures)].sort();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const failures = await checkBuiltSite(process.argv[2] ?? 'dist');
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
  } else console.log('Rutas, redirecciones e imágenes locales correctas.');
}
