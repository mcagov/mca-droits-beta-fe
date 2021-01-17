export function $(el, scope) {
  return (scope || document).querySelectorAll(el);
}

export function $1(el, scope) {
  return (scope || document).querySelector(el);
}

export function closest(selector, el) {
  let elements = [...$(selector)];
  if (!elements.length) return null;
  do {
    el = el.parentNode;
  } while (el && elements.indexOf(el) == -1);
  return el;
}