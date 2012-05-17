// Generated by CoffeeScript 1.3.1
(function() {
  var Assembler, Data, Instr, Instruction, LitValue, MemValue, Module, RawValue, RegValue, dasm, decode;

  Module = {};

  decode = require('./dcpu-decode');

  dasm = require('./dcpu-disasm');

  Instr = decode.Instr;

  RegValue = (function() {

    RegValue.name = 'RegValue';

    function RegValue(asm, reg) {
      this.mAsm = asm;
      this.mReg = reg;
    }

    RegValue.prototype.emit = function(stream) {
      return [];
    };

    RegValue.prototype.encode = function() {
      return this.mReg;
    };

    return RegValue;

  })();

  MemValue = (function() {

    MemValue.name = 'MemValue';

    function MemValue(asm, reg, lit) {
      if (reg == null) {
        reg = void 0;
      }
      if (lit == null) {
        lit = void 0;
      }
      this.mAsm = asm;
      this.mReg = reg;
      this.mLit = lit;
    }

    MemValue.prototype.emit = function(stream) {
      if (!(this.mLit != null)) {
        return;
      }
      if (this.mLit != null) {
        return stream.push(this.mLit.value());
      }
    };

    MemValue.prototype.encode = function() {
      if ((this.mLit != null) && (this.mReg != null) && !this.mLit.isLabel()) {
        return this.mReg + 0x10;
      } else if (this.mReg != null) {
        return this.mReg + 0x8;
      } else if (this.mLit != null) {
        return 0x1e;
      } else {
        return console.log("ERROR: MemValue with corrupted state.");
      }
    };

    return MemValue;

  })();

  LitValue = (function() {

    LitValue.name = 'LitValue';

    function LitValue(asm, lit) {
      var n;
      this.mAsm = asm;
      this.mLit = lit;
      if ((n = parseInt(lit))) {
        this.mLit = n;
      }
      if (this.mLit > 0x1f || this.isLabel()) {
        this.mAsm.incPc();
      }
    }

    LitValue.prototype.isLabel = function() {
      return isNaN(this.mLit);
    };

    LitValue.prototype.value = function() {
      var addr;
      if (this.isLabel()) {
        addr = this.mAsm.lookup(this.mLit);
        if (!(addr != null)) {
          console.log("Undefined label '" + this.mLit + "'");
        }
        return addr;
      } else {
        return this.mLit;
      }
    };

    LitValue.prototype.emit = function(stream) {
      if (this.mLit > 0x1e || this.isLabel()) {
        return stream.push(this.value());
      }
    };

    LitValue.prototype.encode = function() {
      if (this.mLit === -1) {
        return 0x20;
      } else if (this.mLit > 0x1f || this.isLabel()) {
        return 0x1f;
      } else {
        return this.mLit + 0x21;
      }
    };

    return LitValue;

  })();

  RawValue = (function() {

    RawValue.name = 'RawValue';

    function RawValue(asm, raw) {
      this.mAsm = asm;
      this.mRaw = raw;
    }

    RawValue.prototype.emit = function() {
      return;
    };

    RawValue.prototype.encode = function() {
      return this.mRaw;
    };

    return RawValue;

  })();

  Instruction = (function() {

    Instruction.name = 'Instruction';

    function Instruction(asm, opc, vals) {
      this.mAsm = asm;
      this.mLine = 0;
      this.mSize = 0;
      this.mOp = opc;
      this.mVals = vals;
    }

    Instruction.prototype.emit = function(stream) {
      var enc, instr, v, _i, _len, _ref, _results;
      enc = (function() {
        var _i, _len, _ref, _results;
        _ref = this.mVals;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          _results.push(v.encode());
        }
        return _results;
      }).call(this);
      instr = this.mOp | (enc[0] << 5) | (enc[1] << 10);
      stream.push(instr);
      _ref = this.mVals;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        _results.push(v.emit(stream));
      }
      return _results;
    };

    return Instruction;

  })();

  Data = (function() {

    Data.name = 'Data';

    function Data(asm, dat) {
      this.mAsm = asm;
      this.mData = dat;
    }

    Data.prototype.emit = function(stream) {
      return stream.push(this.mData);
    };

    return Data;

  })();

  Assembler = (function() {

    Assembler.name = 'Assembler';

    function Assembler() {
      var op, _i, _j, _len, _len1, _ref, _ref1;
      this.mText = "";
      this.mLabels = {};
      this.mPc = 0;
      this.mInstrs = [];
      this.mOpcDict = {};
      _ref = Instr.BASIC_OPS;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        op = _ref[_i];
        if (op != null) {
          this.mOpcDict[op.id.toUpperCase()] = op;
        }
      }
      _ref1 = Instr.ADV_OPS;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        op = _ref1[_j];
        if (op != null) {
          this.mOpcDict[op.id.toUpperCase()] = op;
        }
      }
    }

    Assembler.prototype.label = function(name, addr) {
      return this.mLabels[name] = addr;
    };

    Assembler.prototype.lookup = function(name) {
      return this.mLabels[name];
    };

    Assembler.prototype.defined = function(name) {
      return lookup(name) != null;
    };

    Assembler.prototype.incPc = function() {
      return ++this.mPc;
    };

    Assembler.prototype.processValue = function(val) {
      var arr_regex, ilit_regex, ireg_regex, lit_regex, match, n, r, reg_regex, regid, success;
      val = val.trim();
      reg_regex = /^([a-zA-Z_]+)/;
      ireg_regex = /^\[\s*([a-zA-Z]+|\d+)\s*\]/;
      lit_regex = /^(0[xX][0-9a-fA-F]+|\d+)/;
      ilit_regex = /^\[\s*(0[xX][0-9a-fA-F]+|\d+)\s*\]/;
      arr_regex = /^\[\s*([0-9a-zA-Z]+)\s*\+\s*([0-9a-zA-Z]+)\s*\]/;
      success = function(val) {
        return {
          result: "success",
          value: val
        };
      };
      if (match = val.match(reg_regex)) {
        switch (match[1]) {
          case "POP":
            return success(new RawValue(this, 0x18));
          case "PEEK":
            return success(new RawValue(this, 0x19));
          case "PUSH":
            return success(new RawValue(this, 0x1a));
          case "SP":
            return success(new RawValue(this, 0x1b));
          case "PC":
            return success(new RawValue(this, 0x1c));
          case "O":
            return success(new RawValue(this, 0x1d));
          default:
            regid = dasm.Disasm.REG_DISASM.indexOf(match[1]);
            if (regid === -1) {
              return success(new LitValue(this, match[1]));
            } else {
              return success(new RegValue(this, regid));
            }
        }
      } else if (match = val.match(ireg_regex)) {
        regid = dasm.Disasm.REG_DISASM.indexOf(match[1]);
        if (regid === -1) {
          return success(new MemValue(this, void 0, new LitValue(this, match[1])));
        } else {
          return success(new MemValue(this, regid, void 0));
        }
      } else if (match = val.match(lit_regex)) {
        return success(new LitValue(this, parseInt(match[1])));
      } else if (match = val.match(ilit_regex)) {
        n = parseInt(match[1]);
        return success(new MemValue(this, void 0, new LitValue(this, n)));
      } else if (match = val.match(arr_regex)) {
        if ((r = dasm.Disasm.REG_DISASM.indexOf(match[2])) !== -1) {
          return success(new MemValue(this, r, new LitValue(this, match[1])));
        }
        if ((r = dasm.Disasm.REG_DISASM.indexOf(match[1])) !== -1) {
          return success(new MemValue(this, r, new LitValue(this, match[2])));
        } else {
          console.log("match[1]: " + match[1]);
          console.log("match[2]: " + match[2]);
          (void 0).crash();
          return {
            result: "fail",
            message: "Unmatched value " + val
          };
        }
        return success(new MemValue(this, r, new LitValue(this, n)));
      } else {
        return r = {
          result: "fail",
          message: "Unmatched value " + val
        };
      }
    };

    Assembler.prototype.processLine = function(line) {
      var adv_regex, basic_regex, c, enc, match, n, opc, r, str_regex, tok, toks, valA, valB, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      line = line.split(";")[0].toUpperCase().trim();
      if (line === "") {
        return r = {
          result: "success"
        };
      }
      basic_regex = /(\w+)\s+([^,]+)\s*,\s*([^,]+)/;
      adv_regex = /(\w+)\s+([^,]+)/;
      str_regex = /"([^"]*)"/;
      toks = line.match(/[^ \t]+/g);
      if (line[0] === ":") {
        this.label(toks[0].slice(1), this.mPc);
        return this.processLine(toks.slice(1).join(" "));
      } else if (line[0] === ";") {
        return {
          result: "success"
        };
      } else if (toks[0] === "DAT") {
        toks = (toks.slice(1).join(" ")).split(",");
        for (_i = 0, _len = toks.length; _i < _len; _i++) {
          tok = toks[_i];
          tok = tok.trim();
          if (match = tok.match(str_regex)) {
            _ref = match[1];
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              c = _ref[_j];
              this.mInstrs.push(new Data(this, c.charCodeAt(0)));
            }
          } else if ((n = parseInt(tok)) != null) {
            this.mInstrs.push(new Data(this, n));
          } else {
            console.log("Bad Data String: '" + tok + "'");
          }
        }
        return {
          result: "success"
        };
      } else if (match = line.match(basic_regex)) {
        _ref1 = match.slice(1, 4), opc = _ref1[0], valA = _ref1[1], valB = _ref1[2];
        if (!(this.mOpcDict[opc] != null)) {
          return r = {
            result: "fail",
            message: "Unknown Opcode: " + opc
          };
        }
        enc = this.mOpcDict[opc].op;
        this.incPc();
        valA = this.processValue(valA);
        if (valA.result !== "success") {
          return valA;
        }
        valB = this.processValue(valB);
        if (valB.result !== "success") {
          return valB;
        }
        this.mInstrs.push(new Instruction(this, enc, [valA.value, valB.value]));
        return r = {
          result: "success"
        };
      } else if (match = line.match(adv_regex)) {
        _ref2 = match.slice(1, 3), opc = _ref2[0], valA = _ref2[1];
        if (!(this.mOpcDict[opc] != null)) {
          return r = {
            result: "fail",
            message: "Unknown Opcode: " + opc
          };
        }
        enc = this.mOpcDict[opc].op;
        this.incPc();
        valB = this.processValue(valA);
        if (valB.result !== "success") {
          return valB;
        }
        valA = new RawValue(this, enc);
        this.mInstrs.push(new Instruction(this, 0, [valA, valB.value]));
        return r = {
          result: "success"
        };
      } else {
        return r = {
          result: "fail",
          source: line,
          message: "Syntax Error"
        };
      }
    };

    Assembler.prototype.emit = function(stream) {
      var i, _i, _len, _ref, _results;
      _ref = this.mInstrs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(i.emit(stream));
      }
      return _results;
    };

    Assembler.prototype.assemble = function(text) {
      var index, l, lines, prog, r, state, _i, _len;
      prog = [];
      lines = text.split("\n");
      index = 1;
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        l = lines[_i];
        state = this.processLine(l);
        if (state.result !== "success") {
          state.line = index;
          return state;
        }
        index++;
      }
      this.emit(prog);
      return r = {
        result: "success",
        code: prog
      };
    };

    return Assembler;

  })();

  exports.Assembler = Assembler;

}).call(this);
