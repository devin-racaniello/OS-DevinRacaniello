var TSOS;
(function (TSOS) {
    var CpuInput = /** @class */ (function () {
        function CpuInput(command, contents) {
            if (command === void 0) { command = "00"; }
            if (contents === void 0) { contents = ["00", "00"]; }
            this.command = command;
            this.contents = contents;
        }
        return CpuInput;
    }());
    TSOS.CpuInput = CpuInput;
})(TSOS || (TSOS = {}));
