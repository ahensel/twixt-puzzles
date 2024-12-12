class Move {
  constructor() {
    this.removedLinks = [];
    this.addedLinks = [];
    this.peg = null;
  }

  removeLink(link) {
    const index = this.indexOf(this.addedLinks, link);
    if (index >= 0) {
      this.addedLinks.splice(index, 1);
    } else {
      this.removedLinks.push(link);
    }
  }

  addLink(link) {
    const index = this.indexOf(this.removedLinks, link);
    if (index >= 0) {
      this.removedLinks.splice(index, 1);
    } else {
      this.addedLinks.push(link);
    }
  }

  indexOf(links, link) {
    return links.findIndex(l => l.toString() === link.toString());
  }

  sortLinks(links) {
    return [...links].sort((link1, link2) => {
      const link1y = link1.peg1.y + link1.peg2.y;
      const link2y = link2.peg1.y + link2.peg2.y;
      
      if (link1y !== link2y) return link1y - link2y;
      
      const link1x = link1.peg1.x + link1.peg2.x;
      const link2x = link2.peg1.x + link2.peg2.x;

      return link1x - link2x;
    });
  }

  setPeg(peg) {
    this.peg = peg;
  }

  getText() {
    const removedLinksText = this.sortLinks(this.removedLinks)
      .map(link => link.getRemoveNotation())
      .join('');
    
    const addedLinksText = this.sortLinks(this.addedLinks)
      .map(link => link.getAddNotation())
      .join('');
    
    return removedLinksText + addedLinksText + this.peg.getNotation();
  }
}
