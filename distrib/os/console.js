///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, commandHistory, commandCounter, tabCounter) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (commandHistory === void 0) { commandHistory = []; }
            if (commandCounter === void 0) { commandCounter = 0; }
            if (tabCounter === void 0) { tabCounter = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.commandHistory = commandHistory;
            this.commandCounter = commandCounter;
            this.tabCounter = tabCounter;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.clearLine = function () {
            _DrawingContext.clearRect(0, this.currentYPosition - 14, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    this.commandHistory.push(this.buffer);
                    this.commandCounter = this.commandHistory.length;
                    this.tabCounter = 0;
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) { //     delete key
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    _DrawingContext.clearRect(0, this.currentYPosition - 14, this.currentXPosition, this.currentYPosition);
                    this.currentXPosition = 0;
                    this.putText(_OsShell.promptStr + this.buffer);
                }
                else if (chr === String.fromCharCode(38) && this.commandCounter > 0) {
                    this.currentXPosition = 0;
                    this.commandCounter -= 1;
                    this.clearLine();
                    this.buffer = this.commandHistory[this.commandCounter];
                    this.putText(_OsShell.promptStr + this.commandHistory[this.commandCounter]);
                }
                else if (chr === String.fromCharCode(40) && this.commandCounter < this.commandHistory.length) {
                    this.currentXPosition = 0;
                    this.commandCounter += 1;
                    this.clearLine();
                    this.buffer = this.commandHistory[this.commandCounter];
                    this.putText(_OsShell.promptStr + this.commandHistory[this.commandCounter]);
                }
                else if (chr === String.fromCharCode(9)) {
                    var possibleCommands = [];
                    for (var i in _OsShell.commandList) {
                        if (this.buffer == _OsShell.commandList[i].command.substring(0, this.buffer.length)) {
                            possibleCommands.push(_OsShell.commandList[i].command);
                        }
                        //this.putText("buffer: " +this.buffer);
                        //this.advanceLine();
                        //this.putText("checker: " +_OsShell.commandList[i].command.substring(0,this.buffer.length));
                        //this.advanceLine();
                    }
                    if (possibleCommands.length > 0) {
                        this.currentXPosition = 0;
                        this.clearLine();
                        this.buffer = possibleCommands[this.tabCounter];
                        this.putText(_OsShell.promptStr + possibleCommands[this.tabCounter]);
                        this.tabCounter += 1;
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                    this.tabCounter = 0;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition >= _Canvas.height) {
                var imageData = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                this.clearScreen();
                this.currentYPosition -= (_DefaultFontSize
                    + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin);
                _DrawingContext.putImageData(imageData, 0, -(_DefaultFontSize
                    + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin));
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
