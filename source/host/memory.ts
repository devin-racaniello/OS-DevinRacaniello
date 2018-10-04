///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires globals.ts


     ------------ */
module TSOS {

    export class Memory {
        public memoryArray = new Array(9999);

        constructor() {
        }

        public init(): void {
            for (var i = 0; i < this.memoryArray.length; i++){
                this.memoryArray[i] = "00";
            }
        }


    }
}

