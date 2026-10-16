export function getCarouselOrder(length, seed) {
  const order = Array.from({ length }, (_, index) => index);
  let state = 2166136261;
  for (const character of String(seed))
    state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  const random = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  for (let index = order.length - 1; index > 1; index--) {
    const target = 1 + Math.floor(random() * index);
    [order[index], order[target]] = [order[target], order[index]];
  }
  return order;
}
