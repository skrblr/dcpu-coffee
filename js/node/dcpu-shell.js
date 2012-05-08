// Generated by CoffeeScript 1.3.1
(function() {
  var Dcpu16Shell, asm, cmd, dasm, dcpu, fs, shell,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  cmd = require('./cmd');

  dcpu = require('../dcpu');

  dasm = require('../dcpu-disasm');

  asm = require('../dcpu-asm');

  Dcpu16Shell = (function(_super) {

    __extends(Dcpu16Shell, _super);

    Dcpu16Shell.name = 'Dcpu16Shell';

    function Dcpu16Shell() {
      var inst;
      inst = this;
      this.wordsPerLine = 8;
      this.mTrace = false;
      this.prompt = ">> ";
      this.asm = new asm.Assembler();
      this.dcpu = new dcpu.Dcpu16();
      this.dcpu.onPreExec(function(i) {
        if (inst.mTrace) {
          return console.log(dasm.Disasm.ppInstr(i));
        }
      });
      this.dcpu.onCondFail(function(i) {
        if (inst.mTrace) {
          return console.log("::SKIP: " + (dasm.Disasm.ppInstr(i)));
        }
      });
      this.intro = "\n*******************************************************\n* DCPU-16 Shell                                       *\n* Send Bugs to Tim Detwiler <timdetwiler@gmail.com>   *\n*******************************************************";
    }

    Dcpu16Shell.prototype.do_load = function(toks) {
      var cpu, fn;
      fn = toks[0];
      cpu = this.dcpu;
      return fs.readFile(fn, "utf8", function(err, data) {
        if (!err) {
          return cpu.loadBinary(eval(data));
        } else {
          return console.log("Error loading binary");
        }
      });
    };

    Dcpu16Shell.prototype.help_load = function() {
      return "Loads a binary into memory.";
    };

    Dcpu16Shell.prototype.do_asm = function(toks) {
      var cpu, fn;
      fn = toks[0];
      asm = this.asm;
      cpu = this.dcpu;
      return fs.readFile(fn, "utf8", function(err, data) {
        var prog, txt;
        if (!err) {
          prog = asm.assemble(data);
          if (toks[1] != null) {
            txt = JSON.stringify(prog);
            return fs.writeFile(toks[1], txt, function(err) {
              if (err) {
                return console.log("Error writing out binary");
              }
            });
          } else {
            return cpu.loadBinary(prog);
          }
        } else {
          return console.log("Error assembling file");
        }
      });
    };

    Dcpu16Shell.prototype.do_disasm = function(toks) {
      var addr, d, _results;
      addr = toks[0] != null ? parseInt(toks[0]) : 0;
      _results = [];
      while (this.dcpu.readMem(addr)) {
        d = dasm.Disasm.ppInstr(addr);
        console.log("" + (dasm.Disasm.fmtHex(addr)) + "| " + d.text);
        _results.push(addr += d.len);
      }
      return _results;
    };

    Dcpu16Shell.prototype.do_run = function(toks) {
      this.mTrace = false;
      return this.dcpu.run();
    };

    Dcpu16Shell.prototype.help_run = function() {
      return "Run the Simulator";
    };

    Dcpu16Shell.prototype.do_step = function(toks) {
      this.mTrace = true;
      return this.dcpu.step();
    };

    Dcpu16Shell.prototype.help_step = function() {
      return console.log("Executes a single DCPU-16 instruction");
    };

    Dcpu16Shell.prototype.do_regs = function(toks) {
      var f;
      f = dasm.Disasm.fmtHex;
      console.log("A:  0x" + (f(this.dcpu.regA())) + "\t B:  0x" + (f(this.dcpu.regB())) + "\t C: 0x" + (f(this.dcpu.regC())));
      console.log("X:  0x" + (f(this.dcpu.regX())) + "\t Y:  0x" + (f(this.dcpu.regY())) + "\t Z: 0x" + (f(this.dcpu.regZ())));
      console.log("I:  0x" + (f(this.dcpu.regI())) + "\t J:  0x" + (f(this.dcpu.regJ())));
      return console.log("PC: 0x" + (f(this.dcpu.regPC())) + "\t SP: 0x" + (f(this.dcpu.regSP())) + "\t O: 0x" + (f(this.dcpu.regO())));
    };

    Dcpu16Shell.prototype.help_regs = function() {
      return console.log("Print DCPU Registers.");
    };

    Dcpu16Shell.prototype.do_dump = function(toks) {
      var a, f, n, x, y, _i, _j, _ref, _ref1, _results;
      f = dasm.Disasm.fmtHex;
      a = parseInt(toks[0]);
      if (!(a != null)) {
        return help_dump();
      }
      n = toks[1] != null ? parseInt(toks[1]) : 4 * this.wordsPerLine;
      console.log("Dumping " + n + " bytes at " + (f(a)));
      _results = [];
      for (x = _i = 0, _ref = (n / this.wordsPerLine) - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        process.stdout.write("" + (f(a)) + "| ");
        for (y = _j = 0, _ref1 = this.wordsPerLine - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
          process.stdout.write("" + (f(this.dcpu.readMem(a + y))) + " ");
        }
        process.stdout.write("\n");
        _results.push(a += this.wordsPerLine);
      }
      return _results;
    };

    Dcpu16Shell.prototype.help_dump = function() {
      return console.log("Dump memory.");
    };

    Dcpu16Shell.prototype.do_shell = void 0;

    Dcpu16Shell.prototype.help_shell = void 0;

    return Dcpu16Shell;

  })(cmd.Cmd);

  process.on("SIGINT", function() {
    return console.log("Oh Hey.");
  });

  shell = new Dcpu16Shell();

  shell.cmdloop();

}).call(this);
