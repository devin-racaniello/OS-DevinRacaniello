///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57) && (!isShifted)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13) ||                       // enter
                        (keyCode == 8)  || (keyCode == 9)   ||   // backspace //tab
                        (keyCode == 38) || (keyCode == 40)) {    // upArrow //downArrow

                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if ((((keyCode >= 48) && (keyCode <= 57)) && isShifted) || //shifted digits
                       (((keyCode >= 187) && (keyCode <= 191)))) { //punctuation
                switch (keyCode){
                    //TODO: handle keycodes
                    case 48:
                        _StdOut.putText(")");
                        break;
                    case 49:
                        _StdOut.putText("!");
                        break;
                    case 50:
                        _StdOut.putText("@");
                        break;
                    case 51:
                        _StdOut.putText("#");
                        break;
                    case 52:
                        _StdOut.putText("$");
                        break;
                    case 53:
                        _StdOut.putText("%");
                        break;
                    case 54:
                        _StdOut.putText("^");
                        break;
                    case 55:
                        _StdOut.putText("&");
                        break;
                    case 56:
                        _StdOut.putText("*");
                        break;
                    case 57:
                        _StdOut.putText("(");
                        break;

                    case 187:
                        _StdOut.putText("=");
                        break;
                    case 188:
                        _StdOut.putText(",");
                        break;
                    case 189:
                        _StdOut.putText("-");
                        break;
                    case 190:
                        _StdOut.putText(".");
                        break;
                    case 191:
                        _StdOut.putText("/");
                        break;

                }

            }


        }
    }
}
