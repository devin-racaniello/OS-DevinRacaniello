///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        public name = "default user";


        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                "whereami",
                "- Displays the users location.");
            this.commandList[this.commandList.length] = sc;

            // setName
            sc = new ShellCommand(this.shellSetName,
                "setname",
                "<string> - Sets the users name to  <string>.");
            this.commandList[this.commandList.length] = sc;

            // getName
            sc = new ShellCommand(this.shellGetName,
                "getname",
                "- Displays the users location.");
            this.commandList[this.commandList.length] = sc;

            // updateStatus
            sc = new ShellCommand(this.shellUpdateStatus,
                "updatestatus",
                "<string> - Updates the status with a <string>.");
            this.commandList[this.commandList.length] = sc;

            // break
            sc = new ShellCommand(this.shellBreak,
                "break",
                "- We have broken him.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.load,
                "load",
                "- Loads hexcode into memory");
            this.commandList[this.commandList.length] = sc;

            //run
            sc = new ShellCommand(this.run,
                "run",
                "- Executes the selected code");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else if(cmd == "v" || cmd == "version") {
                this.execute(this.shellVer, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " Version: " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("These are a list of valid commands that can be used");
                        for (var i in _OsShell.commandList) {
                            _StdOut.advanceLine();
                            _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                        }
                        _StdOut.advanceLine();
                        _StdOut.putText("Enter: man (command name) for information  on a specific function");
                        break;

                    case "ver":
                        _StdOut.putText("Displays the version of the operating system");
                        _StdOut.advanceLine();
                        _StdOut.putText("Usage: ver.");
                        break;
                    case "help":
                        _StdOut.putText("Lists the available commands and their descriptions");
                        _StdOut.advanceLine();
                        _StdOut.putText("Usage: help");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shuts down the OS but leaves the virtual system up");
                        _StdOut.advanceLine();
                        _StdOut.putText("Usage: shutdown");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the screen");
                        _StdOut.advanceLine();
                        _StdOut.putText("Usage: cls");
                        break;
                    case "man":
                        _StdOut.putText("Provides a manual for how using the system including commands and how to use them");
                        _StdOut.advanceLine();
                        _StdOut.putText("Usage: man <topic>  Please supply a topic.");
                        break;
                    case "trace":
                        _StdOut.putText("Toggles the OS trace");
                        _StdOut.advanceLine();
                        _StdOut.putText("Usage: trace <on | off>");
                        break;
                    case "rot13":
                        _StdOut.putText("does a rot13 obfuscation on a string");
                        _StdOut.advanceLine();
                        _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
                        break;
                    case "prompt":
                        _StdOut.putText("Sets a prompt");
                        _StdOut.advanceLine();
                        _StdOut.putText("Usage: prompt <string>  Please supply a string.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate() {
            var displayDate = new Date().toLocaleDateString();
            _StdOut.putText("The current date is "+displayDate);
        }

        public shellWhereAmI() {
            _StdOut.putText("Probing location...");
            _StdOut.advanceLine();
            _StdOut.putText("You are in the darkest depths of the Indian Ocean.");
        }


        public shellSetName(args) {
            if (args.length > 0) {
                var text = "";
                for (var i in args) {
                    text += args[i] + " ";
                }
                _OsShell.name = text;
            } else {
                _StdOut.putText("Usage: setname <string>  Please supply a string.");
            }
        }


        public shellGetName() {
            _StdOut.putText("Your name is "+_OsShell.name);
        }

        public shellUpdateStatus(args) {
            if (args.length > 0) {
                var text = "";
                for (var i in args) {
                    text += args[i] + " ";
                }
                _StdOut.putText("Status: "+text);
                document.getElementById("divStatus").innerHTML = "Status: " + text;
                _Status = text;
            }
        }

        public shellBreak() {
            _Kernel.krnTrapError("I feel dead inside.")
        }

        public load(){
            var userInput = (document.getElementById("taProgramInput") as HTMLInputElement).value;
            var valid = true;

            for(var i = 0; i < userInput.length; i++) {
                if (!((parseInt(userInput.charAt(i)) >= 0 && parseInt(userInput.charAt(i)) <= 9) ||
                    ((userInput.charAt(i) >= "A") && (userInput.charAt(i) <= "F")) ||
                    userInput.charAt(i) == " ")) {
                    valid = false;
                    break;
                } else {
                    valid = true;
                }
            }

            if(valid){
                _StdOut.putText("Loaded");
                _StdOut.advanceLine();
                /*_StdOut.putText(_CPU.parseCommand(userInput).toString());
                _StdOut.advanceLine();
                _StdOut.putText("Command: "+_CPU.parseCommand(userInput)[0].command);
                _StdOut.advanceLine();
                _StdOut.putText("Contents: "+_CPU.parseCommand(userInput)[0].contents.toString());
                _StdOut.advanceLine();
                _StdOut.putText("Command: "+_CPU.parseCommand(userInput)[1].command);
                _StdOut.advanceLine();
                _StdOut.putText("Contents: "+_CPU.parseCommand(userInput)[1].contents.toString());
                _StdOut.advanceLine();*/
                //_StdOut.putText(_CPU.displayCommandList(_CPU.parseCommand(userInput)));
                //_CPU.excecuteCommand(_CPU.parseCommand(userInput));
                _CPU.loadCommand(_PID,userInput);
                _StdOut.putText("PID: "+_PID);
                _PID ++;
            } else {
                _StdOut.putText("Load Failure, use proper format.");
            }

        }

        public run(PID) {
            _CPU.excecuteCommand(PID);
        }





    }
}
