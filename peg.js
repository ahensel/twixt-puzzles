class Peg {
  constructor(color, x, y) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.links = [];
  }

  getXnotation(x) {
    return " abcdefghijklmnopqrstuvwx".charAt(x);
  }

  getYnotation(y) {
    return String(y);
  }

  getNotation() {
    return this.getXnotation(this.x) + this.getYnotation(this.y);
  }

  getLinkIndex(dx, dy) {
    return ((dx > 0) ? 2 : 0) + ((dy > 0) ? 3 : 2) + dy;
  }

  addLink(link) {
    this.links[link.getIndex(this)] = link;
  }

  removeLink(link) {
    this.links[link.getIndex(this)] = null;
  }

  getLink(dx, dy) {
    return this.links[this.getLinkIndex(dx, dy)];
  }

  getLinks() {
    return this.links.filter(link => !!link);
  }

  hasLink(dx, dy) {
    return !!this.getLink(dx, dy);
  }
}
