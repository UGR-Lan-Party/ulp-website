/** Distance-constrained Verlet cloth, simulated in the rotating hanger's frame. */
export class ClothDynamics {
  /** @param {Float32Array} rest @param {number[]} edges @param {number[]} pinned */
  constructor(rest, edges, pinned) {
    this.rest = rest.slice();
    this.positions = rest.slice();
    this.previous = rest.slice();
    this.weights = new Float32Array(rest.length / 3).fill(1);
    pinned.forEach((i) => {
      this.weights[i] = 0;
    });
    this.edges = new Uint32Array(edges);
    this.lengths = new Float32Array(edges.length / 2);
    for (let i = 0; i < edges.length; i += 2) {
      const a = edges[i] * 3,
        b = edges[i + 1] * 3;
      this.lengths[i / 2] = Math.hypot(
        rest[b] - rest[a],
        rest[b + 1] - rest[a + 1],
        rest[b + 2] - rest[a + 2],
      );
    }
  }

  reset() {
    this.positions.set(this.rest);
    this.previous.set(this.rest);
  }

  /** @param {number} delta @param {{spin?:number, acceleration?:number, gravity?:number}} motion */
  step(delta, motion = {}) {
    const dt = Math.min(Math.max(delta, 0), 1 / 30);
    if (!dt) return;
    const spin = Math.max(-10, Math.min(10, motion.spin || 0));
    const acceleration = Math.max(-45, Math.min(45, motion.acceleration || 0));
    const gravity = motion.gravity ?? -0.55;
    const damping = Math.pow(0.965, dt * 60),
      squared = dt * dt;
    const p = this.positions,
      previous = this.previous,
      rest = this.rest;
    for (let i = 0; i < p.length; i += 3) {
      if (!this.weights[i / 3]) continue;
      const ax = (rest[i] - p[i]) * 24 + spin * spin * rest[i] * 0.012;
      const ay = (rest[i + 1] - p[i + 1]) * 24 + gravity;
      const az =
        (rest[i + 2] - p[i + 2]) * 22 +
        acceleration * rest[i] * 0.12 -
        spin * (1.1 - rest[i + 1]) * 0.06;
      for (let axis = 0; axis < 3; axis++) {
        const at = i + axis,
          current = p[at];
        p[at] +=
          (current - previous[at]) * damping +
          (axis === 0 ? ax : axis === 1 ? ay : az) * squared;
        previous[at] = current;
      }
    }
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 0; i < this.edges.length; i += 2) {
        const a = this.edges[i],
          b = this.edges[i + 1],
          wa = this.weights[a],
          wb = this.weights[b];
        const sum = wa + wb;
        if (!sum) continue;
        const ia = a * 3,
          ib = b * 3;
        const dx = p[ib] - p[ia],
          dy = p[ib + 1] - p[ia + 1],
          dz = p[ib + 2] - p[ia + 2];
        const distance = Math.hypot(dx, dy, dz);
        if (distance < 1e-8) continue;
        const correction =
          (((distance - this.lengths[i / 2]) / distance) * 0.82) / sum;
        for (let axis = 0; axis < 3; axis++) {
          const change = (axis === 0 ? dx : axis === 1 ? dy : dz) * correction;
          p[ia + axis] += change * wa;
          p[ib + axis] -= change * wb;
        }
      }
    }
    for (let i = 0; i < p.length; i += 3) {
      if (!this.weights[i / 3]) {
        p.set(rest.subarray(i, i + 3), i);
        previous.set(rest.subarray(i, i + 3), i);
        continue;
      }
      const distance = Math.hypot(
        p[i] - rest[i],
        p[i + 1] - rest[i + 1],
        p[i + 2] - rest[i + 2],
      );
      if (distance > 0.22)
        for (let axis = 0; axis < 3; axis++)
          p[i + axis] =
            rest[i + axis] + ((p[i + axis] - rest[i + axis]) * 0.22) / distance;
    }
  }
}
