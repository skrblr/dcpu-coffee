// Generated by CoffeeScript 1.3.1
(function() {
  var $, DcpuWebapp, GenericClock, GenericKeyboard, Lem1802, Module, asm, dasm, dcpu, decode;

  Module = {};

  dcpu = require('../dcpu');

  dasm = require('../dcpu-disasm');

  decode = require('../dcpu-decode');

  asm = require('../dcpu-asm');

  Lem1802 = require('../hw/lem1802').Lem1802;

  GenericClock = require('../hw/generic-clock').GenericClock;

  GenericKeyboard = require('../hw/generic-keyboard').GenericKeyboard;

  $ = window.$;

  DcpuWebapp = (function() {

    DcpuWebapp.name = 'DcpuWebapp';

    function DcpuWebapp() {
      this.mAsm = null;
      this.mRunTimer = null;
      this.mRegs = [$("#RegA"), $("#RegB"), $("#RegC"), $("#RegX"), $("#RegY"), $("#RegZ"), $("#RegI"), $("#RegJ"), $("#RegPC"), $("#RegSP"), $("#RegEX")];
      this.mCpu = new dcpu.Dcpu16();
      this.setupCallbacks();
      this.setupCPU();
      this.updateCycles();
      this.assemble();
      this.updateRegs();
      this.dumpMemory();
    }

    DcpuWebapp.prototype.updateRegs = function() {
      var i, v, _i, _len, _ref, _results;
      _ref = this.mRegs;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        v = _ref[i];
        _results.push(v.html('0x' + dasm.Disasm.fmtHex(this.mCpu.readReg(i))));
      }
      return _results;
    };

    DcpuWebapp.prototype.updateCycles = function() {
      return $("#cycles").html("" + this.mCpu.mCycles);
    };

    DcpuWebapp.prototype.dumpMemory = function() {
      var base, body, c, col, html, r, row, v, _i, _j, _results;
      base = $("#membase").val();
      if (!base) {
        base = 0;
      }
      base = parseInt(base);
      body = $("#memdump-body");
      body.empty();
      _results = [];
      for (r = _i = 0; _i <= 4; r = ++_i) {
        row = $("<tr><td>" + (dasm.Disasm.fmtHex(base + (r * 8))) + "</td></tr>");
        for (c = _j = 0; _j <= 7; c = ++_j) {
          v = this.mCpu.readMem(base + (r * 8) + c);
          html = "<td>" + (dasm.Disasm.fmtHex(v)) + "</td>";
          col = $(html);
          row.append(col);
        }
        _results.push(body.append(row));
      }
      return _results;
    };

    DcpuWebapp.prototype.error = function(msg) {
      return $("#asm-error").html(msg);
    };

    DcpuWebapp.prototype.assemble = function() {
      var exe;
      this.mAsm = new asm.Assembler();
      exe = this.mAsm.assembleAndLink(window.editor.getValue());
      if (exe.result !== "success") {
        this.error("Error: Line " + exe.line + ": " + exe.message);
      }
      this.mCpu.loadJOB(exe);
      this.mCpu.regPC(0);
      this.dumpMemory();
      return this.updateRegs();
    };

    DcpuWebapp.prototype.run = function() {
      var app, cb;
      app = this;
      cb = function() {
        var i, _i;
        for (i = _i = 0; _i <= 10001; i = ++_i) {
          app.mCpu.step();
        }
        app.updateRegs();
        return app.updateCycles();
      };
      if (this.mRunTimer) {
        clearInterval(this.timer);
      }
      return this.mRunTimer = setInterval(cb, 50);
    };

    DcpuWebapp.prototype.step = function() {
      this.mCpu.step();
      return this.updateRegs();
    };

    DcpuWebapp.prototype.stop = function() {
      if (this.mRunTimer) {
        clearInterval(this.mRunTimer);
        return this.mRunTimer = null;
      }
    };

    DcpuWebapp.prototype.reset = function() {
      this.mCpu.reset();
      this.assemble();
      return this.updateCycles();
    };

    DcpuWebapp.prototype.setupCPU = function() {
      this.mCpu.addDevice(new Lem1802(this.mCpu, $("#framebuffer")[0]));
      this.mCpu.addDevice(new GenericClock(this.mCpu));
      return this.mCpu.addDevice(new GenericKeyboard(this.mCpu));
    };

    DcpuWebapp.prototype.setupCallbacks = function() {
      var app;
      app = this;
      $("#membase").change(function() {
        var base;
        base = $("#membase").val();
        if (!base) {
          base = 0;
        }
        return app.dumpMemory(parseInt(base));
      });
      $("#btnRun").click(function() {
        return app.run();
      });
      $("#btnStep").click(function() {
        return app.step();
      });
      $("#btnStop").click(function() {
        return app.stop();
      });
      $("#btnReset").click(function() {
        return app.reset();
      });
      return $("#btnAssemble").click(function() {
        return app.assemble();
      });
    };

    return DcpuWebapp;

  })();

  $(function() {
    return new DcpuWebapp();
  });

}).call(this);
