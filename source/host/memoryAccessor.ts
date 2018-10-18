///<reference path="../globals.ts" />
///<reference path="memory.ts" />

/* ------------
     MemoryAccessor.ts

     Requires globals.ts


     ------------ */
module TSOS {

    export class MemoryAccessor {
        public memoryArray = [];

        constructor() {
        }

        public init(): void {
            var mem;

            for (var i = 0; i <= 9999; i++){
                mem = new Memory("00",i);
                this.memoryArray[this.memoryArray.length] = mem;
            }
        }

        public setMemory(value,location) {
            var sMem;
            sMem = new Memory(value,location);
            this.memoryArray[location] = sMem;
            this.memDisplay();
        }

        public getMemory(location) {
            var temp = this.memoryArray[location].location;
            return this.memoryArray[location];
        }

        public findHole(size,first = 0) {
            var clear = true;
            for (var i = first; i < size + first; i+=1) {
                if (this.getMemory(0).value!=="00"){
                    clear = false;
                    break;
                }
            }
            if (clear == true) {
                return(first);
            } else {
                this.findHole(size,first+1);
            }
        }

        public memDisplay() {
            var mem = "";

            for (var i = 0; i < this.memoryArray.length; i++){

                if (i%10 == 0 && i != 0) {
                    mem += "\n";
                }
                mem += "["+this.memoryArray[i].value+ "] ";

            }
            document.getElementById("memDisp").innerHTML = mem;

        }




    }
}

