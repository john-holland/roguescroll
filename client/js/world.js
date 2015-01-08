var CellType = {
    Room: 1,
    Hallway: 2,
    Trap: 4,
    Chest: 8,
    Ladder: 16
}

CellType.getTypes = function() {
    var types = [];
    
    for(var prop in CellType) {
        if (CellType.hasOwnProperty(prop) && prop !== 'getTypes' && prop !== 'getMasks') {
            types.push({name: prop, mask: CellType[prop]});
        }
    }
    
    return types;
}

CellType.getTypesForMask = function(mask) {
    var mask = [];
    
    return _.filter(CellType.getTypes(), function(type) {
        return mask & type.mask;
    });
}

/**
 * @param cellType: The starting mask for the cell type.
 * @param contents: An optional contents map, should be indexable by all available masks on cellType and will be validated as such.
 */
function Cell(y, max, cellType, contents) {
    var self = this;
    this.y = y;
    this.cellType = cellType;
    this.contents = contents || { };
    
    CellType.getTypesForMask(this.cellType).forEach(function(type) {
        if (!(type.mask in self.contents)) {
            throw new Error("Missing contents for cellType: " + type.name + " for cell: " + self.y);
        }
    });
}

Cell.prototype.addType(cellType) {
    this.mask |= cellType;
}

function Room(cellRange) {
    this.min = cellRange.min;
    this.max = cellRange.max;
}

function Hallway(cellRange) {
    this.min = cellRange.min;
    this.max = cellRange.max;
}

function Level(name, seed) {
    //cells, indexed 
    var self = this;
    this.cells = [];
    this.rooms = [];
    
    this.makeRange = function(count, cellType, contents) {
        var min = self.cells.length,
        max = min + count,
        range = max - min;
        
        for (var i = 0; i < range; i++) {
            this.cells.push(new Cell(min + i, cellType, contents));
        }
    }
    
    this.generate = function() {
        //seems like a good idea
        //http://chancejs.com/#weighted
        //make rooms: pick a length / type, push onto list.
        self.makeRange(_.random(5, 10), CellType.Room, { Room: { } });
        
        //make hallways: pick a length / type, push onto list between rooms.
        
        //make cells for rooms and hallways: foreach thing on the list, generate cells
        
        //put monsters, traps and chests in cells: add masks to cells
        //  chests can only be in rooms
    }
}