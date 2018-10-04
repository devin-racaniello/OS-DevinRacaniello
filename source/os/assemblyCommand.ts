module TSOS {
    export class AssemblyCommand {
        constructor(public func: any,
                    public hexCode = "",
                    public description = "") {
        }
    }
}
