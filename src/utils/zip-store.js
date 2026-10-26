const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
/** Small, uncompressed ZIP writer for already-compressed PNG files. */
export function createStoredZip(entries) {
  if (!Array.isArray(entries) || entries.length > 64)
    throw new Error('Paquete demasiado grande');
  const encoder = new TextEncoder(),
    files = [],
    directory = [],
    names = new Set();
  let offset = 0,
    directorySize = 0;
  for (const { name, bytes } of entries) {
    if (
      typeof name !== 'string' ||
      !name ||
      /[\\\u0000-\u001f]/.test(name) ||
      name.startsWith('/') ||
      name.includes(':') ||
      name.split('/').some((p) => !p || p === '.' || p === '..') ||
      names.has(name)
    )
      throw new Error('Ruta ZIP no válida');
    if (!(bytes instanceof Uint8Array) || bytes.byteLength > 64 * 1024 * 1024)
      throw new Error('Archivo ZIP no válido');
    names.add(name);
    const filename = encoder.encode(name),
      checksum = crc32(bytes);
    const header = new Uint8Array(30 + filename.length),
      view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x800, true);
    view.setUint16(12, 0x21, true);
    view.setUint32(14, checksum, true);
    view.setUint32(18, bytes.byteLength, true);
    view.setUint32(22, bytes.byteLength, true);
    view.setUint16(26, filename.length, true);
    header.set(filename, 30);
    const central = new Uint8Array(46 + filename.length),
      cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x800, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, checksum, true);
    cv.setUint32(20, bytes.byteLength, true);
    cv.setUint32(24, bytes.byteLength, true);
    cv.setUint16(28, filename.length, true);
    cv.setUint32(42, offset, true);
    central.set(filename, 46);
    files.push(header, bytes);
    directory.push(central);
    offset += header.length + bytes.length;
    directorySize += central.length;
    if (offset > 128 * 1024 * 1024) throw new Error('Paquete demasiado grande');
  }
  const end = new Uint8Array(22),
    ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, directorySize, true);
  ev.setUint32(16, offset, true);
  return new Blob([...files, ...directory, end], { type: 'application/zip' });
}
