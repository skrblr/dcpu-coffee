// Generated by CoffeeScript 1.3.1
(function() {
  var Disasm, Module;

  Module = {};

  Disasm = (function() {

    Disasm.name = 'Disasm';

    function Disasm() {}

    Disasm.OPC_DISASM = ["ADV", "SET", "ADD", "SUB", "MUL", "DIV", "MOD", "SHL", "SHR", "AND", "BOR", "XOR", "IFE", "IFN", "IFG", "IFB"];

    Disasm.ADV_OPC_DISASM = ["RSV", "JSR"];

    Disasm.REG_DISASM = ["A", "B", "C", "X", "Y", "Z", "I", "J", "PC", "SP", "O"];

    Disasm.fmtHex = function(n, pad) {
      var p, str, _, _i, _ref;
      if (pad == null) {
        pad = true;
      }
      str = n.toString(16);
      p = "";
      if (pad) {
        for (_ = _i = 0, _ref = 4 - str.length; 0 <= _ref ? _i <= _ref : _i >= _ref; _ = 0 <= _ref ? ++_i : --_i) {
          p = p + "0";
        }
      }
      return p.slice(1) + str;
    };

    Disasm.ppInstr = function(i) {
      var op, va, vb;
      if (i.opc() === 0) {
        op = Disasm.ADV_OPC_DISASM[i.valA().raw()];
        va = Disasm.ppValue(i.valB());
        return "" + op + " " + va;
      } else {
        op = Disasm.OPC_DISASM[i.opc()];
        console.lo;
        va = Disasm.ppValue(i.valA());
        vb = Disasm.ppValue(i.valB());
        return "" + op + " " + va + ", " + vb;
      }
    };

    Disasm.ppValue = function(val) {
      var enc, lit, reg, v;
      enc = val.raw();
      v = "";
      if ((0x00 <= enc && enc <= 0x07)) {
        v = Disasm.REG_DISASM[enc];
      } else if ((0x08 <= enc && enc <= 0x0f)) {
        reg = Disasm.REG_DISASM[enc - 0x8];
        v = "[" + reg + "]";
      } else if ((0x10 <= enc && enc <= 0x17)) {
        lit = val.mNext.toString(16);
        reg = Disasm.REG_DISASM[enc - 0x10];
        v = "[0x" + lit + "+" + reg + "]";
      } else if (enc === 0x18) {
        v = "POP";
      } else if (enc === 0x19) {
        v = "PEEK";
      } else if (enc === 0x1a) {
        v = "PUSH";
      } else if (enc === 0x1b) {
        v = "SP";
      } else if (enc === 0x1c) {
        v = "PC";
      } else if (enc === 0x1d) {
        v = "O";
      } else if (enc === 0x1e) {
        lit = val.mNext.toString(16);
        v = "[0x" + lit + "]";
      } else if (enc === 0x1f) {
        lit = val.mNext.toString(16);
        v = "0x" + lit;
      } else if ((0x20 <= enc && enc <= 0x3f)) {
        lit = val.mNext.toString(16);
        v = "0x" + ((enc - 0x20).toString(16));
      }
      return v;
    };

    return Disasm;

  })();

  exports.Disasm = Disasm;

}).call(this);
