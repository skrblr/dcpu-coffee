// Generated by CoffeeScript 1.3.1
(function() {
  var Dcpu16, Disasm, IStream, Instr, Module, Value, decode;

  Module = {};

  decode = require('./dcpu-decode');

  Disasm = require('./dcpu-disasm').Disasm;

  Value = decode.Value;

  Instr = decode.Instr;

  IStream = decode.IStream;

  Dcpu16 = (function() {

    Dcpu16.name = 'Dcpu16';

    function Dcpu16() {
      var cpu, name, op, x, _i, _j, _len, _len1, _ref, _ref1;
      cpu = this;
      this.mCycles = 0;
      this.mCCFail = false;
      this.mIntQueueOn = false;
      this.mMemory = (function() {
        var _i, _results;
        _results = [];
        for (x = _i = 0; 0 <= 0xffff ? _i <= 0xffff : _i >= 0xffff; x = 0 <= 0xffff ? ++_i : --_i) {
          _results.push(0);
        }
        return _results;
      })();
      this.mIStream = new IStream(this.mMemory);
      this.mRegStorage = (function() {
        var _i, _results;
        _results = [];
        for (x = _i = 0; 0 <= 0xf ? _i <= 0xf : _i >= 0xf; x = 0 <= 0xf ? ++_i : --_i) {
          _results.push(0);
        }
        return _results;
      })();
      this.mRegStorage[Value.REG_SP] = 0xffff;
      this.mRegAccess = [
        this._regGen(Value.REG_A), this._regGen(Value.REG_B), this._regGen(Value.REG_C), this._regGen(Value.REG_X), this._regGen(Value.REG_Y), this._regGen(Value.REG_Z), this._regGen(Value.REG_I), this._regGen(Value.REG_J), function(v) {
          return cpu.mIStream.index(v);
        }, this._regGen(Value.REG_SP), this._regGen(Value.REG_EX), this._regGen(Value.REG_IA)
      ];
      this.mExecutors = [];
      this.mAdvExecutors = [];
      _ref = Instr.BASIC_OPS;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        op = _ref[_i];
        if (op != null) {
          name = "_exec_" + (op.id.toLowerCase());
          this.mExecutors[op.op] = name;
        }
      }
      _ref1 = Instr.ADV_OPS;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        op = _ref1[_j];
        if (op != null) {
          name = "_exec_" + (op.id.toLowerCase());
          this.mAdvExecutors[op.op] = name;
        }
      }
      this.mDevices = [];
      this.mMappedRegions = [];
    }

    Dcpu16.prototype.onPreExec = function(fn) {
      return this.mPreExec = fn;
    };

    Dcpu16.prototype.onPostExec = function(fn) {
      return this.mPostExec = fn;
    };

    Dcpu16.prototype.onCondFail = function(fn) {
      return this.mCondFail = fn;
    };

    Dcpu16.prototype.reg = function(n, v) {
      return this.mRegAccess[n](v);
    };

    Dcpu16.prototype.regA = function(v) {
      return this.reg(Value.REG_A, v);
    };

    Dcpu16.prototype.regB = function(v) {
      return this.reg(Value.REG_B, v);
    };

    Dcpu16.prototype.regC = function(v) {
      return this.reg(Value.REG_C, v);
    };

    Dcpu16.prototype.regX = function(v) {
      return this.reg(Value.REG_X, v);
    };

    Dcpu16.prototype.regY = function(v) {
      return this.reg(Value.REG_Y, v);
    };

    Dcpu16.prototype.regZ = function(v) {
      return this.reg(Value.REG_Z, v);
    };

    Dcpu16.prototype.regI = function(v) {
      return this.reg(Value.REG_I, v);
    };

    Dcpu16.prototype.regJ = function(v) {
      return this.reg(Value.REG_J, v);
    };

    Dcpu16.prototype.regSP = function(v) {
      return this.reg(Value.REG_SP, v);
    };

    Dcpu16.prototype.regEX = function(v) {
      return this.reg(Value.REG_EX, v);
    };

    Dcpu16.prototype.regPC = function(v) {
      return this.reg(Value.REG_PC, v);
    };

    Dcpu16.prototype.regIA = function(v) {
      return this.reg(Value.REG_IA, v);
    };

    Dcpu16.prototype.readReg = function(n) {
      return this.reg(n);
    };

    Dcpu16.prototype.writeReg = function(n, val) {
      return this.reg(n, val);
    };

    Dcpu16.prototype.readMem = function(addr) {
      var region;
      region = this.isMapped(addr);
      if (region) {
        return region.f(addr - region.base);
      } else {
        return this.mMemory[addr];
      }
    };

    Dcpu16.prototype.writeMem = function(addr, val) {
      var region;
      region = this.isMapped(addr);
      if (region) {
        return region.f(addr - region.base, val);
      } else {
        return this.mMemory[addr] = val;
      }
    };

    Dcpu16.prototype.isMapped = function(addr) {
      var region, _i, _len, _ref;
      _ref = this.mMappedRegions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        region = _ref[_i];
        if ((region.base <= addr && addr < region.base + region.len)) {
          return region;
        }
      }
      return null;
    };

    Dcpu16.prototype.mapDevice = function(addr, len, cb) {
      return this.mMappedRegions.push({
        base: addr,
        len: len,
        f: cb
      });
    };

    Dcpu16.prototype.unmapDevice = function(addr) {
      var i, newList, region, _i, _ref;
      newList = [];
      for (i = _i = 0, _ref = this.mMappedRegions.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        region = this.mMappedRegions[i];
        if (region.base !== addr) {
          newList.push(region);
        }
      }
      return this.mMappedRegions = newList;
    };

    Dcpu16.prototype.addDevice = function(dev) {
      return this.mDevices.push(dev);
    };

    Dcpu16.prototype.push = function(v) {
      var sp;
      sp = this.regSP(this.regSP() - 1);
      return this.mMemory[sp] = v;
    };

    Dcpu16.prototype.peek = function() {
      var sp;
      sp = this.regSP();
      return this.mMemory[sp];
    };

    Dcpu16.prototype.pop = function() {
      var sp;
      sp = this.regSP(this.regSP() + 1);
      return this.mMemory[sp - 1];
    };

    Dcpu16.prototype.loadBinary = function(bin, base) {
      var i, x, _i, _len;
      if (base == null) {
        base = 0;
      }
      for (i = _i = 0, _len = bin.length; _i < _len; i = ++_i) {
        x = bin[i];
        this.mMemory[base + i] = x;
      }
      return this.regPC(base);
    };

    Dcpu16.prototype.step = function() {
      var i, _results;
      i = new Instr(this.mIStream);
      if (this.mPreExec != null) {
        this.mPreExec(i);
      }
      this.exec(i);
      if (this.mPostExec != null) {
        this.mPostExec(i);
      }
      _results = [];
      while (this.mCCFail) {
        i = new Instr(this.mIStream);
        this.mCCFail = i.cond();
        if (this.mCondFail != null) {
          _results.push(this.mCondFail(i));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Dcpu16.prototype.exec = function(i) {
      var f, opc, valA, valB;
      opc = i.opc();
      valA = i.valA();
      valB = i.valB();
      this.mCycles += i.cost();
      f = this.mExecutors[opc];
      if (!(f != null)) {
        return console.log("Unable to execute OPC " + opc);
      }
      return this[f](valA, valB);
    };

    Dcpu16.prototype.interrupt = function(n) {
      var ia;
      ia = this.regIA();
      if (ia === 0) {
        return;
      }
      if (this.mIntQueuOn) {
        return;
      }
      this.mIntQueueOn = true;
      this.push(this.regPC());
      this.push(this.regA());
      this.regPC(this.regIA());
      return this.regA(n);
    };

    Dcpu16.prototype.signed = function(v) {
      if (v & 0x8000) {
        return -(0x10000 - v);
      } else {
        return v;
      }
    };

    Dcpu16.prototype.signExtend = function(v) {
      if (v < 0) {
        return (~(-v) + 1) & 0xffff;
      } else {
        return v;
      }
    };

    Dcpu16.prototype._regGen = function(n) {
      var cpu;
      cpu = this;
      return function(v) {
        if (v != null) {
          return cpu.mRegStorage[n] = v;
        } else {
          return cpu.mRegStorage[n];
        }
      };
    };

    Dcpu16.prototype._exec_adv = function(a, b) {
      var f, opc;
      opc = a.raw();
      f = this.mAdvExecutors[opc];
      if (!(f != null)) {
        return console.log("Unable to execute Advanced Opcode " + opc);
      }
      return this[f](b);
    };

    Dcpu16.prototype._exec_set = function(a, b) {
      return a.set(this, b.get(this));
    };

    Dcpu16.prototype._exec_add = function(a, b) {
      var v;
      v = a.get(this) + b.get(this);
      if (v > 0xffff) {
        this.regEX(1);
        v -= 0xffff;
      } else {
        this.regEX(0);
      }
      return a.set(this, v);
    };

    Dcpu16.prototype._exec_sub = function(a, b) {
      var v;
      v = a.get(this) - b.get(this);
      if (v < 0) {
        this.regEX(0xffff);
        v += 0xffff;
      } else {
        this.regEX(0);
      }
      return a.set(this, v);
    };

    Dcpu16.prototype._exec_mul = function(a, b) {
      var v;
      v = a.get(this) * b.get(this);
      a.set(this, v & 0xffff);
      return this.regEX((v >> 16) & 0xffff);
    };

    Dcpu16.prototype._exec_mli = function(a, b) {
      var v;
      v = (this.signed(a.get(this))) * (this.signed(b.get(this)));
      v = this.signExtend(v);
      a.set(this, v & 0xffff);
      return this.regEX((v >> 16) & 0xffff);
    };

    Dcpu16.prototype._exec_div = function(a, b) {
      var v;
      if (b.get(this) === 0) {
        a.set(this, 0);
        return this.regEX(0);
      } else {
        v = a.get(this) / b.get(this);
        a.set(this, v & 0xffff);
        return this.regEX(((a.get(this) << 16) / b.get(this)) & 0xffff);
      }
    };

    Dcpu16.prototype._exec_dvi = function(a, b) {
      var v;
      if (b.get(this) === 0) {
        a.set(this, 0);
        return this.regEX(0);
      } else {
        v = (a.get(this)) / (this.signed(b.get(this)));
        a.set(this, v & 0xffff);
        return this.regEX(((a.get(this) << 16) / (this.signed(b.get(this)))) & 0xffff);
      }
    };

    Dcpu16.prototype._exec_mod = function(a, b) {
      if (b.get(this) === 0) {
        return a.set(this, 0);
      } else {
        return a.set(this, a.get(this) % b.get(this));
      }
    };

    Dcpu16.prototype._exec_mdi = function(a, b) {
      if (b.get(this) === 0) {
        return a.set(this, 0);
      } else {
        return a.set(this, (this.signed(a.get(this))) % (this.signed(b.get(this))));
      }
    };

    Dcpu16.prototype._exec_and = function(a, b) {
      return a.set(this, a.get(this) & b.get(this));
    };

    Dcpu16.prototype._exec_bor = function(a, b) {
      return a.set(this, a.get(this) | b.get(this));
    };

    Dcpu16.prototype._exec_xor = function(a, b) {
      return a.set(this, a.get(this) ^ b.get(this));
    };

    Dcpu16.prototype._exec_shr = function(a, b) {
      a.set(this, a.get(this) >> b.get(this));
      return this.regEX(((a.get(this) << 16) >> b.get(this)) & 0xffff);
    };

    Dcpu16.prototype._exec_shl = function(a, b) {
      a.set(this, a.get(this) << b.get(this));
      return this.regEX(((a.get(this) << b.get(this)) >> 16) & 0xffff);
    };

    Dcpu16.prototype._exec_ifb = function(a, b) {
      if ((a.get(this) & b.get(this)) === 0) {
        return this.mCCFail = true;
      }
    };

    Dcpu16.prototype._exec_ifc = function(a, b) {
      if ((a.get(this) & b.get(this)) !== 0) {
        return this.mCCFail = true;
      }
    };

    Dcpu16.prototype._exec_ife = function(a, b) {
      if (a.get(this) !== b.get(this)) {
        return this.mCCFail = true;
      }
    };

    Dcpu16.prototype._exec_ifn = function(a, b) {
      if (a.get(this) === b.get(this)) {
        return this.mCCFail = true;
      }
    };

    Dcpu16.prototype._exec_ifg = function(a, b) {
      if (a.get(this) <= b.get(this)) {
        return this.mCCFail = true;
      }
    };

    Dcpu16.prototype._exec_ifl = function(a, b) {
      if (a.get(this) >= b.get(this)) {
        return this.mCCFail = true;
      }
    };

    Dcpu16.prototype._exec_ifa = function(a, b) {
      if ((this.signed(a.get(this))) <= (this.signed(b.get(this)))) {
        return this.mCCFail = true;
      }
    };

    Dcpu16.prototype._exec_ifu = function(a, b) {
      if ((this.signed(a.get(this))) >= (this.signed(b.get(this)))) {
        return this.mCCFaile = true;
      }
    };

    Dcpu16.prototype._exec_adx = function(a, b) {
      return;
    };

    Dcpu16.prototype._exec_sbx = function(a, b) {
      return;
    };

    Dcpu16.prototype._exec_asr = function(a, b) {
      return;
    };

    Dcpu16.prototype._exec_sti = function(a, b) {
      b.set(this, a.get(this));
      this.regJ(this.regJ() + 1);
      return this.regI(this.regI() + 1);
    };

    Dcpu16.prototype._exec_std = function(a, b) {
      b.set(this, a.get(this));
      this.regJ(this.regJ() - 1);
      return this.regI(this.regI() - 1);
    };

    Dcpu16.prototype._exec_jsr = function(a) {
      this.push(this.regPC());
      return this.regPC(a.get());
    };

    Dcpu16.prototype._exec_int = function(a) {
      var n;
      n = a.get(this);
      return this.interrupt(n);
    };

    Dcpu16.prototype._exec_iag = function(a) {
      return a.set(this, this.regIA());
    };

    Dcpu16.prototype._exec_ias = function(a) {
      return this.regIA(a.get(this));
    };

    Dcpu16.prototype._exec_rfi = function(a) {
      this.mIntQueueOn = false;
      this.regA(this.pop());
      return this.regPC(this.pop());
    };

    Dcpu16.prototype._exec_iaq = function(a) {
      var n;
      n = a.get(this);
      return this.mIntQueueOn = n !== 0;
    };

    Dcpu16.prototype._exec_hwn = function(a) {
      return a.set(this, this.mDevices.length);
    };

    Dcpu16.prototype._exec_hwq = function(a) {
      var dev, i;
      i = a.get(this);
      dev = this.mDevices[i];
      if (dev != null) {
        return dev.query();
      }
    };

    Dcpu16.prototype._exec_hwi = function(a) {
      var dev, i;
      i = a.get(this);
      dev = this.mDevices[i];
      if (dev != null) {
        return dev.hwInterrupt();
      }
    };

    return Dcpu16;

  })();

  exports.Dcpu16 = Dcpu16;

}).call(this);
