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
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.ar = [];
            this.ur = [];
            this.processTable = [];
            this.assemblyCommands = [];
            this.curPID = 0;
            this.doCommand = false;
            this.opNum = 0;
            this.commandArray = [];
            this.branch = 0;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.ar[0] = new TSOS.CpuInput("00", ["00", "00"]);
            var ac;
            ac = new TSOS.CpuInput("A9", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("AD", ["00", "00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("8D", ["00", "00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("6D", ["00", "00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("A2", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("AE", ["00", "00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("A0", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("AC", ["00", "00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("EA", []);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("00", []);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("EC", ["00", "00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("D0", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("EE", ["00", "00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
            ac = new TSOS.CpuInput("FF", ["00"]);
            this.assemblyCommands[this.assemblyCommands.length] = ac;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.doCommand) {
                this.commandArray = this.parseCommand(this.codeFromMem(this.curPID));
                this.opNum = 0;
                this.clearCode(this.curPID);
                this.doCommand = false;
            }
            if (this.opNum < this.commandArray.length + this.branch) {
                switch (this.commandArray[this.opNum].command) {
                    case "A9":
                        this.setAcc(parseInt(this.commandArray[this.opNum].contents[0]));
                        break;
                    case "AD":
                        this.setAcc(_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0])).value);
                        break;
                    case "8D":
                        _MemoryAccesor.setMemory(this.Acc, this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0]));
                        break;
                    case "6D":
                        this.setAcc(this.Acc + _MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0])).value);
                        break;
                    case "A2":
                        this.setX(parseInt(this.commandArray[this.opNum].contents[0]));
                        break;
                    case "AE":
                        this.setX(_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0])).value);
                        break;
                    case "A0":
                        this.setY(parseInt(this.commandArray[this.opNum].contents[0]));
                        break;
                    case "AC":
                        this.setY(_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0])));
                        break;
                    case "00":
                        this.opNum = this.commandArray.length;
                        break;
                    case "EC":
                        if (this.Xreg == _MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0])).value) {
                            this.Zflag = 0;
                        }
                        break;
                    case "D0":
                        //this.setAcc(command[1]);
                        break;
                    case "EE":
                        _MemoryAccesor.setMemory((parseInt(_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0])).value) + 1).toString(16), this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0]));
                        break;
                    case "FF":
                        if (this.Xreg == 1) {
                            this.output = this.Yreg;
                        }
                        if (this.Xreg == 2) {
                            var j = 0;
                            this.output = "";
                            while (_MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0])).value + j !== "00") {
                                this.output += _MemoryAccesor.getMemory(this.hexToInt(this.commandArray[this.opNum].contents[1] + this.commandArray[this.opNum].contents[0])).value + j;
                                j++;
                            }
                        }
                        break;
                }
                this.opNum++;
                this.displayCPU();
            }
            else {
                this.isExecuting = false;
            }
        };
        Cpu.prototype.setAcc = function (input) {
            this.Acc = input;
        };
        Cpu.prototype.setX = function (input) {
            this.Xreg = input;
        };
        Cpu.prototype.setY = function (input) {
            this.Yreg = input;
        };
        Cpu.prototype.setZ = function (input) {
            this.Zflag = input;
            var temp = ["00", "00"];
            var z = new TSOS.CpuInput("00", temp);
            temp = z.contents;
        };
        Cpu.prototype.makeProcess = function (PID) {
            var proc = new TSOS.Pcb(PID);
            this.processTable.push(proc);
            this.displayTable();
        };
        Cpu.prototype.hexToInt = function (hex) {
            return (parseInt(hex, 16));
        };
        Cpu.prototype.displayCommandList = function (commandArray) {
            var comOut = "";
            for (var i = 0; i < commandArray.length; i += 1) {
                comOut += "Cm: " + commandArray[i].command + "\n";
                comOut += "Cn: " + commandArray[i].contents.toString() + "\n";
            }
            return comOut;
        };
        Cpu.prototype.parseInput = function (input) {
            var hexArray = [];
            hexArray = input.split(" ");
            return hexArray;
        };
        Cpu.prototype.loadCommand = function (PID, input) {
            var hexArray = this.parseInput(input);
            this.makeProcess(PID);
            var loc = _MemoryAccesor.findHole(hexArray.length);
            this.processTable[PID].MemLoc = loc;
            this.processTable[PID].size = hexArray.length;
            this.displayCPU();
            this.displayTable();
            for (var i = 0; i < this.processTable[PID].size; i++) {
                _MemoryAccesor.setMemory(hexArray[i], this.processTable[PID].MemLoc + i);
            }
        };
        Cpu.prototype.clearCode = function (PID) {
            for (var i = 0; i < this.processTable[PID].size; i++) {
                _MemoryAccesor.setMemory("00", this.processTable[PID].MemLoc + i);
            }
        };
        Cpu.prototype.codeFromMem = function (PID) {
            var hexArray = [];
            for (var i = 0; i < this.processTable[PID].size; i += 1) {
                hexArray.push(_MemoryAccesor.getMemory(this.processTable[PID].MemLoc + i).value);
            }
            return hexArray;
        };
        Cpu.prototype.parseCommand = function (tempArray) {
            var commandArray = [];
            var com = "ZZ";
            var con = [];
            var doCon = 0;
            var comprox;
            this.ur = tempArray;
            this.displayCPU();
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
                            if (com !== "ZZ") {
                                comprox = new TSOS.CpuInput(com, con);
                                commandArray.push(comprox);
                                con = [];
                            }
                            com = tempArray[i];
                            doCon = this.assemblyCommands[j].contents.length;
                            break;
                        }
                    }
                }
                else {
                    con.push(tempArray[i]);
                    doCon -= 1;
                    if (i == tempArray.length - 1) {
                        comprox = new TSOS.CpuInput(com, con);
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
        };
        Cpu.prototype.excecuteCommand = function (PID) {
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
        };
        Cpu.prototype.displayCPU = function () {
            document.getElementById("cpuDisp").innerHTML = ("Acc X Y Z com con ur\n" +
                this.Acc + " " + this.Xreg + " " + this.Yreg + " " + this.Zflag + " " + this.ar[0].command + " " + this.ar[0].contents.toString() + " " + this.ur.toString() + " ");
        };
        Cpu.prototype.displayTable = function () {
            var tableText = "PID PS MemLoc\n";
            for (var i = 0; i < this.processTable.length; i += 1) {
                tableText += this.processTable[i].PID + " " +
                    this.processTable[i].PS + " " +
                    this.processTable[i].MemLoc + "\n";
            }
            document.getElementById("cpuTable").innerHTML = (tableText);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
