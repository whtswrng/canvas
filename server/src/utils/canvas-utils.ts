const fabric = require('fabric').fabric;

export function makeBorderLine(coords) {
    return new fabric.Line(coords, {
        fill: '#431115',
        stroke: '#433b43',
        strokeWidth: 7,
        selectable: false,
        evented: false,
    });
}