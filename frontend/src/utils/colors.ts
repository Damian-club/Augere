function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = ((h >>> 0) * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function pastelGradientFromString(str: string): string {
  const hash = fnv1a32(str);
  const baseHue = hash % 360;
  const hue1 = baseHue;
  const sat1 = 65 + (hash % 20);
  const light1 = 80 + (hash % 10);
  const hue2 = (baseHue + 15) % 360;
  const sat2 = 70 + ((hash >> 4) % 20);
  const light2 = 45 + ((hash >> 8) % 20);

  return `linear-gradient(135deg, 
    hsl(${hue1}, ${sat1}%, ${light1}%), 
    hsl(${hue2}, ${sat2}%, ${light2}%)
  )`;
}
