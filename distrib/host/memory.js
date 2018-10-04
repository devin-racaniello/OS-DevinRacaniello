///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires globals.ts


     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.memoryArray = new Array(9999);
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.memoryArray.length; i++) {
                this.memoryArray[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
