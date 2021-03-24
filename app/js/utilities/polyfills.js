// Fixes Object doesn't support property or method 'forEach' IE 11
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
