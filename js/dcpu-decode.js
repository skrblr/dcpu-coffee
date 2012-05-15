// Generated by CoffeeScript 1.3.1
(function() {
  var IStream, Instr, Module, Value;

  Module = {};

  IStream = (function() {

    IStream.name = 'IStream';

    function IStream(instrs, base) {
      if (base == null) {
        base = 0;
      }
      this.mStream = instrs;
      this.mDecoded = [];
      this.mIndex = base;
    }

    IStream.prototype.nextWord = function() {
      return this.mStream[this.mIndex++];
    };

    IStream.prototype.index = function(v) {
      if (v != null) {
        return this.mIndex = v;
      } else {
        return this.mIndex;
      }
    };

    IStream.prototype.setPC = function(v) {
      return index(v);
    };

    IStream.prototype.getPC = function() {
      return index();
    };

    return IStream;

  })();

  Value = (function() {
    var _i, _j, _k, _ref, _ref1, _ref2, _results, _results1, _results2;

    Value.name = 'Value';

    _ref = (function() {
      _results = [];
      for (var _i = 0x0; 0x0 <= 0xa ? _i <= 0xa : _i >= 0xa; 0x0 <= 0xa ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this), Value.REG_A = _ref[0], Value.REG_B = _ref[1], Value.REG_C = _ref[2], Value.REG_X = _ref[3], Value.REG_Y = _ref[4], Value.REG_Z = _ref[5], Value.REG_I = _ref[6], Value.REG_J = _ref[7], Value.REG_PC = _ref[8], Value.REG_SP = _ref[9], Value.REG_O = _ref[10];

    _ref1 = (function() {
      _results1 = [];
      for (var _j = 0x18; 0x18 <= 0x1a ? _j <= 0x1a : _j >= 0x1a; 0x18 <= 0x1a ? _j++ : _j--){ _results1.push(_j); }
      return _results1;
    }).apply(this), Value.VAL_POP = _ref1[0], Value.VAL_PEEK = _ref1[1], Value.VAL_PUSH = _ref1[2];

    _ref2 = (function() {
      _results2 = [];
      for (var _k = 0x1b; 0x1b <= 0x1d ? _k <= 0x1d : _k >= 0x1d; 0x1b <= 0x1d ? _k++ : _k--){ _results2.push(_k); }
      return _results2;
    }).apply(this), Value.VAL_SP = _ref2[0], Value.VAL_PC = _ref2[1], Value.VAL_O = _ref2[2];

    function Value(stream, enc) {
      this.mIStream = stream;
      this.isMem = false;
      this.isReg = false;
      this.mEncoding = enc;
      this.mNext = 0;
      if ((0x00 <= enc && enc <= 0x07)) {
        this.isReg = true;
        this.mValue = enc;
      } else if ((0x08 <= enc && enc <= 0x0f)) {
        this.isMem = true;
        this.isReg = true;
        this.mValue = enc - 0x08;
      } else if ((0x10 <= enc && enc <= 0x17)) {
        this.isMem = true;
        this.mNext = this.mIStream.nextWord();
      } else if (enc === Value.VAL_POP) {
        "";

      } else if (enc === Value.VAL_PEEK) {
        "";

      } else if (enc === Value.VAL_PUSH) {
        "";

      } else if (enc === Value.VAL_SP) {
        this.isReg = true;
        this.mValue = Value.REG_SP;
      } else if (enc === Value.VAL_PC) {
        this.isReg = true;
        this.mValue = Value.REG_PC;
      } else if (enc === Value.VAL_O) {
        this.isReg = true;
        this.mValue = Value.REG_O;
      } else if (enc === 0x1e) {
        this.isMem = true;
        this.mNext = this.mIStream.nextWord();
        this.mValue = this.mNext;
      } else if (enc === 0x1f) {
        this.mNext = this.mIStream.nextWord();
        this.mValue = this.mNext;
      } else if ((0x20 <= enc && enc <= 0x3f)) {
        this.mValue = enc - 0x20;
      }
    }

    Value.prototype.get = function(cpu) {
      var addr;
      if (this.isMem && this.isReg) {
        addr = cpu.readReg(this.mValue);
        return cpu.readMem(addr);
      } else if (this.isMem) {
        return cpu.readMem(this.mValue);
      } else if (this.isReg) {
        return cpu.readReg(this.mValue);
      } else if (this.mEncoding === Value.VAL_POP) {
        return cpu.pop();
      } else if (this.mEncoding === Value.VAL_PUSH) {
        return console.log("ERROR: Trying to 'get' PUSH");
      } else if (this.mEncoding === Value.VAL_PEEK) {
        return cpu.peek();
      } else {
        return this.mValue;
      }
    };

    Value.prototype.set = function(cpu, val) {
      var addr;
      if (this.isMem && this.isReg) {
        addr = cpu.readReg(this.mValue);
        return cpu.writeMem(addr, val);
      } else if (this.isMem) {
        return cpu.writeMem(this.mValue, val);
      } else if (this.isReg) {
        return cpu.writeReg(this.mValue, val);
      } else if (this.mEncoding === Value.VAL_POP) {
        return console.log("ERROR: Trying to 'set' POP");
      } else if (this.mEncoding === Value.VAL_PUSH) {
        console.log("Pushing " + val);
        return cpu.push(val);
      } else if (this.mEncoding === Value.VAL_PEEK) {
        return console.log("ERROR: Trying to 'set' PEEK");
      } else {
        return console.log("Error: Attempt to 'set' a literal value");
      }
    };

    Value.prototype.raw = function() {
      return this.mEncoding;
    };

    return Value;

  })();

  Instr = (function() {

    Instr.name = 'Instr';

    Instr.BASIC_OPS = [
      Instr.OPC_ADV = {
        op: 0x00,
        id: "adv",
        cond: false
      }, Instr.OPC_SET = {
        op: 0x01,
        id: "set",
        cost: 1,
        cond: false
      }, Instr.OPC_ADD = {
        op: 0x02,
        id: "add",
        cost: 2,
        cond: false
      }, Instr.OPC_SUB = {
        op: 0x03,
        id: "sub",
        cost: 2,
        cond: false
      }, Instr.OPC_MUL = {
        op: 0x04,
        id: "mul",
        cost: 2,
        cond: false
      }, Instr.OPC_MLI = {
        op: 0x05,
        id: "mli",
        cost: 2,
        cond: false
      }, Instr.OPC_DIV = {
        op: 0x06,
        id: "div",
        cost: 3,
        cond: false
      }, Instr.OPC_DVI = {
        op: 0x07,
        id: "dvi",
        cost: 3,
        cond: false
      }, Instr.OPC_MOD = {
        op: 0x08,
        id: "mod",
        cost: 3,
        cond: false
      }, Instr.OPC_MDI = {
        op: 0x09,
        id: "mdi",
        cost: 3,
        cond: false
      }, Instr.OPC_AND = {
        op: 0x0a,
        id: "and",
        cost: 1,
        cond: false
      }, Instr.OPC_BOR = {
        op: 0x0b,
        id: "bor",
        cost: 1,
        cond: false
      }, Instr.OPC_XOR = {
        op: 0x0c,
        id: "xor",
        cost: 1,
        cond: false
      }, Instr.OPC_SHR = {
        op: 0x0d,
        id: "shr",
        cost: 1,
        cond: false
      }, Instr.OPC_ASR = {
        op: 0x0e,
        id: "asr",
        cost: 1,
        cond: false
      }, Instr.OPC_SHL = {
        op: 0x0f,
        id: "shl",
        cost: 1,
        cond: false
      }, Instr.OPC_IFB = {
        op: 0x10,
        id: "ifb",
        cost: 2,
        cond: true
      }, Instr.OPC_IFC = {
        op: 0x11,
        id: "ifc",
        cost: 2,
        cond: true
      }, Instr.OPC_IFE = {
        op: 0x12,
        id: "ife",
        cost: 2,
        cond: true
      }, Instr.OPC_IFN = {
        op: 0x13,
        id: "ifn",
        cost: 2,
        cond: true
      }, Instr.OPC_IFG = {
        op: 0x14,
        id: "ifg",
        cost: 2,
        cond: true
      }, Instr.OPC_IFA = {
        op: 0x15,
        id: "ifa",
        cost: 2,
        cond: true
      }, Instr.OPC_IFL = {
        op: 0x16,
        id: "ifl",
        cost: 2,
        cond: true
      }, Instr.OPC_IFU = {
        op: 0x17,
        id: "ifu",
        cost: 2,
        cond: true
      }, Instr.OPC_ADX = {
        op: 0x1a,
        id: "adx",
        cost: 3,
        cond: false
      }, Instr.OPC_SBX = {
        op: 0x1b,
        id: "sbx",
        cost: 3,
        cond: false
      }, void 0, void 0, Instr.OPC_STI = {
        op: 0x1e,
        id: "sti",
        cost: 2,
        cond: false
      }, Instr.OPC_STD = {
        op: 0x1f,
        id: "std",
        cost: 2,
        cond: false
      }
    ];

    Instr.ADV_OPS = [
      void 0, Instr.ADV_JSR = {
        op: 0x01,
        id: "jsr",
        cost: 3,
        cond: false
      }, void 0, void 0, void 0, void 0, void 0, void 0, Instr.ADV_INT = {
        op: 0x08,
        id: "int",
        cost: 4,
        cond: false
      }, Instr.ADV_IAG = {
        op: 0x09,
        id: "iag",
        cost: 1,
        cond: false
      }, Instr.ADV_IAS = {
        op: 0x0a,
        id: "ias",
        cost: 1,
        cond: false
      }, Instr.ADV_RFI = {
        op: 0x0b,
        id: "rfi",
        cost: 3,
        cond: false
      }, Instr.ADV_IAQ = {
        op: 0x0c,
        id: "iaq",
        cost: 2,
        cond: false
      }, void 0, void 0, void 0, Instr.ADV_HWN = {
        op: 0x10,
        id: "hwn",
        cost: 2,
        cond: false
      }, Instr.ADV_HWQ = {
        op: 0x11,
        id: "hwq",
        cost: 4,
        cond: false
      }, Instr.ADV_HWI = {
        op: 0x12,
        id: "hwi",
        cost: 4,
        cond: false
      }
    ];

    function Instr(stream) {
      var _ref;
      this.mIStream = stream;
      this.mAddr = this.mIStream.index();
      _ref = this.decode(this.mIStream.nextWord()), this.mOpc = _ref[0], this.mValA = _ref[1], this.mValB = _ref[2];
    }

    Instr.prototype.decode = function(instr) {
      var opcode, valA, valB;
      opcode = instr & this.OPCODE_MASK();
      valB = (instr & this.VALB_MASK()) >> 5;
      valA = (instr & this.VALA_MASK()) >> 10;
      return [opcode, new Value(this.mIStream, valB), new Value(this.mIStream, valA)];
    };

    Instr.prototype.opc = function() {
      return this.mOpc;
    };

    Instr.prototype.valA = function() {
      return this.mValA;
    };

    Instr.prototype.valB = function() {
      return this.mValB;
    };

    Instr.prototype.addr = function() {
      return this.mAddr;
    };

    Instr.prototype.OPCODE_MASK = function() {
      return 0x001f;
    };

    Instr.prototype.VALB_MASK = function() {
      return 0x03e0;
    };

    Instr.prototype.VALA_MASK = function() {
      return 0xfc00;
    };

    return Instr;

  })();

  exports.Value = Value;

  exports.Instr = Instr;

  exports.IStream = IStream;

}).call(this);