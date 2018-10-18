var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(value, location) {
            if (value === void 0) { value = "00"; }
            if (location === void 0) { location = 0; }
            this.value = value;
            this.location = location;
        }
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
