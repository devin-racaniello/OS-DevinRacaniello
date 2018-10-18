var TSOS;
(function (TSOS) {
    var Pcb = /** @class */ (function () {
        function Pcb(PID, size, PS, PC, MemLoc) {
            if (PID === void 0) { PID = 0; }
            if (size === void 0) { size = 0; }
            if (PS === void 0) { PS = "New"; }
            if (PC === void 0) { PC = 0; }
            if (MemLoc === void 0) { MemLoc = 0; }
            this.PID = PID;
            this.size = size;
            this.PS = PS;
            this.PC = PC;
            this.MemLoc = MemLoc;
        }
        Pcb.prototype.init = function () {
            this.PS = "New";
            this.PC = 0;
            this.MemLoc = 0;
            this.size = 0;
        };
        return Pcb;
    }());
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
