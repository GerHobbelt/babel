function f(b) {
  a: for (const k in []) {
    if (k) {
      continue b;
    } else {
      break b;
    }
  }
}
