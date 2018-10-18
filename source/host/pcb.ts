module TSOS {

    export class Pcb {


        constructor(public PID: number = 0,
                    public size = 0,
                    public PS: string = "New",
                    public PC: number = 0,
                    public MemLoc: number = 0) {

        }

        public init(): void {
            this.PS = "New";
            this.PC = 0;
            this.MemLoc = 0;
            this.size = 0;


        }

    }
}

