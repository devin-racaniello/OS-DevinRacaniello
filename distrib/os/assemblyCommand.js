var TSOS;
(function (TSOS) {
    var AssemblyCommand = /** @class */ (function () {
        function AssemblyCommand(func, hexCode, description) {
            if (hexCode === void 0) { hexCode = ""; }
            if (description === void 0) { description = ""; }
            this.func = func;
            this.hexCode = hexCode;
            this.description = description;
        }
        return AssemblyCommand;
    }());
    TSOS.AssemblyCommand = AssemblyCommand;
})(TSOS || (TSOS = {}));
