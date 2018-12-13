///<reference path="../globals.ts" />
///<reference path="memory.ts" />
/* ------------
     MemoryAccessor.ts

     Requires globals.ts


     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
            this.memoryArray = [];
        }
        MemoryAccessor.prototype.init = function () {
            var mem;
            for (var i = 0; i <= 65535; i++) {
                mem = new TSOS.Memory("00", i);
                this.memoryArray[this.memoryArray.length] = mem;
            }
        };
        MemoryAccessor.prototype.setMemory = function (value, location) {
            var sMem;
            sMem = new TSOS.Memory(value, location);
            this.memoryArray[location] = sMem;
            this.memDisplay();
        };
        MemoryAccessor.prototype.hexToInt = function (hex) {
            return (parseInt(hex, 16));
        };
        MemoryAccessor.prototype.getMemory = function (location) {
            var temp = this.memoryArray[location].location;
            return this.memoryArray[location];
        };
        MemoryAccessor.prototype.findHole = function (size, first) {
            if (first === void 0) { first = 0; }
            var clear = true;
            for (var i = first; i < size + first; i += 1) {
                if (this.getMemory(0).value !== "00") {
                    clear = false;
                    break;
                }
            }
            if (clear == true) {
                return (first);
            }
            else {
                this.findHole(size, first + 1);
            }
        };
        MemoryAccessor.prototype.memDisplay = function () {
            var mem = "";
            for (var i = 0; i < this.memoryArray.length; i++) {
                if (i % 10 == 0 && i != 0) {
                    mem += "\n";
                }
                mem += "[" + this.memoryArray[i].value + "] ";
            }
            document.getElementById("memDisp").innerHTML = mem;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
