"use strict";

global.Description = class Description {
    constructor(brief, full) {
        this.brief = brief || "";
        this.full  = full  || "";
    }

    get hasDescription() {
        return Boolean(this.brief.length || this.full.length);
    }
}

global.Argument = class Argument {
    constructor(idx, name, type, description) {
        this.idx  = idx  || "";
        this.name = name || "";
        this.type = type || "";
        this.description = description || new Description();
    }
}

global.ReturnType = class ReturnType {
    constructor(type, description) {
        this.type = type || "";
        this.description = description || new Description();
    }
}

global.Method = class Method {
    constructor(name, args, returnType, description) {
        this.args = (args && args.sort((a, b) => {
            if(a.idx < b.idx) return -1;
            if(a.idx > b.idx) return 1;
            return 0;
        })) || [];
        this.name = name || "";
        this.returnType = returnType || new ReturnType();
        this.description = description || new Description();
    }

    getArg(nameOrIdx) {
        var f = this.args.filter(e => {
            return (isNaN(nameOrIdx) && e.name === nameOrIdx) || e.idx == nameOrIdx;
        });

        if(f.length > 1)
            console.warn("GetArg of Method", name, " has found multiple arguments with the same name or idx of", nameOrIdx);

        return f[0];
    }

    get doAnyArgsHaveDescrips() {
        for(var arg of this.args) {
            if(arg.hasDescription) return true;
        }

        return false;
    }
}

global.Constant = class Constant {
    constructor(name, val, description) {
        this.name = name || "";
        this.value = val || "";
        this.description = description || new Description();
    }
}

global.Member = class Member {
    constructor(name, type, description) {
        this.name = name || "";
        this.type = type || "";
        this.description = description || new Description();
    }
}

global.Signal = class Signal {
    constructor(name, args, description) {
        this.name = name || "";
        this.args = (args && args.sort((a, b) => {
            if(a.idx < b.idx) return -1;
            if(a.idx > b.idx) return 1;
            return 0;
        })) || [];
        this.description = description || new Description();
    }
}

global.Class = class Class {
    constructor(category, inherits, name, briefDescrip, fullDescrip) {
        this.category = category || "";
        this.inherits = inherits || "";
        this.name     = name     || "";
        this.description = new Description(briefDescrip, fullDescrip);

        this.methods = [];
        this.constants = [];
        this.members = [];
        this.signals = [];
    }
}
