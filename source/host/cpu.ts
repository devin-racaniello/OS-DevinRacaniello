///<reference path="../globals.ts" />
///<reference path="cpuInput.ts" />
///<reference path="pcb.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {
        public ar = [];
        public ur = [];
        public processTable = [];
        public assemblyCommands = [];

        public curPID = 0;
        public doCommand = false;
        public opNum = 0;
        public commandArray = [];
        public output;
        public branch = 0;


        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;

            this.ar[0] = new CpuInput("00",["00","00"]);

            var ac;

            ac = new CpuInput("A9", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("AD", ["00","00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("8D", ["00","00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("6D", ["00","00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("A2", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("AE", ["00","00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("A0", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("AC", ["00","00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("EA", []);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("00", []);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("EC", ["00","00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("D0", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("EE", ["00","00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;

            ac = new CpuInput("FF", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;




        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            if (this.doCommand) {
                this.commandArray = this.parseCommand(this.codeFromMem(this.curPID));
                this.opNum = 0;
                this.clearCode(this.curPID);

                this.doCommand = false;
            }

            if (this.opNum < this.commandArray.length+this.branch){

                switch (this.commandArray[this.opNum].command) {
                    case "A9":
                        this.setAcc(parseInt(this.commandArray[this.opNum].contents[0]));
                        break;

                    case "AD":
                        this.setAcc(_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0])).value);
                        break;

                    case "8D":
                        _MemoryAccesor.setMemory(this.Acc,this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0]));
                        break;

                    case "6D":
                        this.setAcc(this.Acc + _MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0])).value);
                        break;

                    case "A2":
                        this.setX(parseInt(this.commandArray[this.opNum].contents[0]));
                        break;

                    case "AE":
                        this.setX(_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0])).value);
                        break;

                    case "A0":
                        this.setY(parseInt(this.commandArray[this.opNum].contents[0]));
                        break;

                    case "AC":
                        this.setY(_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0])));
                        break;

                    case "00":
                        this.opNum = this.commandArray.length;
                        break;

                    case "EC":
                        if (this.Xreg == _MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0])).value){
                            this.Zflag = 0;
                        }
                        break;

                    case "D0":
                        //this.setAcc(command[1]);
                        break;

                    case "EE":
                        _MemoryAccesor.setMemory(
                            (parseInt(_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0])).value)+1).toString(16),
                            this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0]));
                        break;

                    case "FF":
                        if(this.Xreg == 1) {
                            this.output = this.Yreg;
                        }
                        if(this.Xreg == 2) {
                            var j = 0;
                            this.output = "";
                            while (_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0])).value+j !== "00" ){

                                this.output += _MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1]+this.commandArray[this.opNum].contents[0])).value+j
                                j++
                            }
                        }
                        break;

                }
                this.opNum++;
                this.displayCPU();
            } else {
                this.isExecuting = false;
            }






        }

        public setAcc(input): void {
            this.Acc = input;
        }

        public setX(input): void {
            this.Xreg = input;
        }

        public setY(input): void {
            this.Yreg = input;
        }

        public setZ(input): void {
            this.Zflag = input;
            var temp = ["00","00"];
            var z = new CpuInput("00",temp);
            temp = z.contents;
        }

        public makeProcess(PID) {
            var proc = new Pcb(PID);
            this.processTable.push(proc);
            this.displayTable();

        }

        public hexToInt(hex) {
            return(parseInt(hex, 16));
        }

        public displayCommandList(commandArray) {
            var comOut = "";

            for (var i = 0; i < commandArray.length; i+=1) {
                comOut += "Cm: "+commandArray[i].command+"\n";
                comOut += "Cn: "+commandArray[i].contents.toString()+"\n";
            }

            return comOut;
        }

        public parseInput(input) {
            var hexArray = [];
            hexArray = input.split(" ");
            return hexArray;
        }

        public loadCommand(PID,input) {

            var hexArray = this.parseInput(input);
            this.makeProcess(PID);

            var loc = _MemoryAccesor.findHole(hexArray.length);

            this.processTable[PID].MemLoc = loc;
            this.processTable[PID].size = hexArray.length;
            this.displayCPU();
            this.displayTable();
            for (var i = 0; i < this.processTable[PID].size; i++) {
                _MemoryAccesor.setMemory(hexArray[i],this.processTable[PID].MemLoc+i);
            }

        }

        public clearCode(PID) {

            for (var i = 0; i < this.processTable[PID].size; i++) {
                _MemoryAccesor.setMemory("00",this.processTable[PID].MemLoc+i);
            }

        }

        public codeFromMem(PID) {
            var hexArray = [];
            for (var i = 0; i < this.processTable[PID].size; i+=1) {
               hexArray.push(_MemoryAccesor.getMemory(this.processTable[PID].MemLoc+i).value);
            }

            return hexArray;

        }

        public parseCommand(tempArray) {
            var commandArray = [];
            var com = "ZZ";
            var con = [];
            var doCon = 0;
            var comprox;

            this.ur = tempArray;
            this.displayCPU()

            /*for (var i = 0; i < tempArray.length; i+=1) {
                if ((tempArray[i].charAt(0) >= "A") && (tempArray[i].charAt(0) <= "F") || (tempArray[i].charAt(1) >= "A") && (tempArray[i].charAt(1) <= "F")) {
                    if (com !== "ZZ"){
                        comprox = new CpuInput(com,con);
                        commandArray.push(comprox);
                        con = [];
                    }
                    com = tempArray[i];

                } else if (i == tempArray.length - 1) {
                    comprox = new CpuInput(com,con);
                    commandArray.push(comprox);
                } else {
                    con.push(tempArray[i]);
                }
            }*/

            for (var i = 0; i < tempArray.length; i++) {
                if (doCon < 1) {
                    for (var j = 0; j < this.assemblyCommands.length; j++) {
                        if (tempArray[i] == this.assemblyCommands[j].command) {

                            //only adds the commands once all the contents are available
                            if (com !== "ZZ"){
                                comprox = new CpuInput(com,con);
                                commandArray.push(comprox);
                                con = [];
                            }

                            com = tempArray[i];
                            doCon = this.assemblyCommands[j].contents.length;
                            break;
                        }
                    }
                } else {
                    con.push(tempArray[i]);
                    doCon -= 1;
                    if (i == tempArray.length - 1) {
                        comprox = new CpuInput(com,con);
                        commandArray.push(comprox);
                    }
                }



            }

            /*for (var i = 0; i <= input.length; i+=1){
                if ((input.charAt(i) >= "A") && (input.charAt(i) <= "F") || (input.charAt(i+1) >= "A") && (input.charAt(i+1) <= "F")) {
                    if (i-sep > 2) {
                        comprox = new CpuInput(com,con);
                        commandArray.push(comprox);
                        this.ar = commandArray;
                        con = [];
                    }
                    com = input.charAt(i) + input.charAt(i+1);
                    sep = i+2;
                    i++;
                } else if ((input.charAt(i) == " ") && !((input.charAt(i+1) >= "A") && (input.charAt(i+1) <= "F") || (input.charAt(i+2) >= "A") && (input.charAt(i+2) <= "F"))) {
                    con.push(input.charAt(i+1)+input.charAt(i+2));
                } else if (i == input.length) {
                    comprox = new CpuInput(com,con);
                    commandArray.push(comprox);
                    this.ar = commandArray;
                }
            }*/
            this.commandArray = commandArray;
            return commandArray;



        }

        public excecuteCommand(PID) {

            this.isExecuting = true;
            this.doCommand = true;
            this.curPID = PID;

            /*var commandArray = this.parseCommand(this.codeFromMem(PID));
            this.clearCode(PID);
            var breaker = false;


            for (var i = 0; i < commandArray.length; i+=1) {
                if (breaker == true){
                    break;
                }
                switch (commandArray[i].command) {
                    case "A9":
                        this.setAcc(parseInt(commandArray[i].contents[0]));
                        break;

                    case "AD":
                        this.setAcc(_MemoryAccesor.getMemory(parseInt(commandArray[i].contents[1]+commandArray[i].contents[0])).value);
                        break;

                    case "8D":
                        _MemoryAccesor.setMemory(this.Acc,parseInt(commandArray[i].contents[1]+commandArray[i].contents[0]));
                        break;

                    case "6D":
                        this.setAcc(this.Acc + _MemoryAccesor.getMemory(parseInt(commandArray[i].contents[1]+commandArray[i].contents[0])).value);
                        break;

                    case "A2":
                        this.setX(parseInt(commandArray[i].contents[0]));
                        break;

                    case "AE":
                        this.setX(_MemoryAccesor.getMemory(parseInt(commandArray[i].contents[1]+commandArray[i].contents[0])).value);
                        break;

                    case "A0":
                        this.setY(parseInt(commandArray[i].contents[0]));
                        break;

                    case "AC":
                        this.setY(_MemoryAccesor.getMemory(parseInt(commandArray[i].contents[1]+commandArray[i].contents[0])));
                        break;

                    case "00":
                        breaker = true;
                        break;

                    case "EC":
                        if (this.Xreg == _MemoryAccesor.getMemory(parseInt(commandArray[i].contents[1]+commandArray[i].contents[0])).value){
                            this.Zflag = 0;
                        }
                        break;

                    case "D0":
                        //this.setAcc(command[1]);
                        break;

                    case "EE":
                        _MemoryAccesor.setMemory(
                            _MemoryAccesor.getMemory(parseInt(commandArray[i].contents[1]+commandArray[i].contents[0])).value+1,
                            parseInt(commandArray[i].contents[1]+commandArray[i].contents[0]));
                        break;

                    case "FF":
                        if(this.Xreg == 1) {
                            return this.Yreg;
                        }
                        if(this.Xreg == 2) {
                            var j = 0;
                            var output = "";
                            while (_MemoryAccesor.getMemory(parseInt(commandArray[i].contents[1]+commandArray[i].contents[0])).value+j !== "00" ){

                                output += _MemoryAccesor.getMemory(parseInt(commandArray[i].contents[1]+commandArray[i].contents[0])).value+j
                                j++
                            }
                            return output;//00terminated string at y
                        }
                        break;

                }
            }*/





        }

        public displayCPU() {
            document.getElementById("cpuDisp").innerHTML = ("Acc X Y Z com con ur\n"+
                this.Acc+" "+this.Xreg+" "+this.Yreg+" "+this.Zflag+" "+this.ar[0].command+" "+this.ar[0].contents.toString()+" "+this.ur.toString()+" ");
        }

        public displayTable() {
            var tableText = "PID PS MemLoc\n";
            for (var i = 0; i < this.processTable.length; i+=1) {
                tableText += this.processTable[i].PID+" "+
                            this.processTable[i].PS+" "+
                            this.processTable[i].MemLoc+"\n"
            }
            document.getElementById("cpuTable").innerHTML = (tableText);
        }
    }
}
