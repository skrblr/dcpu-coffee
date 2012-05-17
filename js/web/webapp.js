// Generated by CoffeeScript 1.3.1
(function() {
  var $, asm, assemble, cpu, dasm, dcpu, decode, dumpMemory, lem1802, onExec, regs, run, timer, updateCycles, updateDisasm, updateRegs;

  $ = require('jquery-browserify');

  dcpu = require('../dcpu');

  dasm = require('../dcpu-disasm');

  decode = require('../dcpu-decode');

  asm = require('../dcpu-asm');

  lem1802 = require('../hw/lem1802');

  cpu = new dcpu.Dcpu16();

  onExec = function(i) {
    var disasm, id;
    disasm = dasm.Disasm.ppInstr(i);
    $(".instruction").removeClass("current-instruction");
    id = "#pc" + (i.addr());
    $(id).addClass("current-instruction");
    return window.editor.setLineClass(1, "myclass", "myclass");
  };

  cpu.onPostExec(onExec);

  regs = [];

  timer = null;

  updateRegs = function() {
    var i, v, _i, _len, _results;
    _results = [];
    for (i = _i = 0, _len = regs.length; _i < _len; i = ++_i) {
      v = regs[i];
      _results.push(v.html('0x' + dasm.Disasm.fmtHex(cpu.readReg(i))));
    }
    return _results;
  };

  updateDisasm = function() {
    var addr, child, disasm, istream, parent, s, _results;
    parent = $("#disasm");
    disasm = "";
    addr = 0;
    istream = new decode.IStream(cpu.mMemory);
    _results = [];
    while (s = dasm.Disasm.ppNextInstr(istream)) {
      child = $("<span id='pc" + addr + "' class='instruction'>" + (dasm.Disasm.fmtHex(addr)) + " | " + s + "</span><br>");
      parent.append(child);
      _results.push(addr = istream.index());
    }
    return _results;
  };

  updateCycles = function() {
    var cycles;
    cycles = "" + cpu.mCycles;
    return $("#cycles").html(cycles);
  };

  dumpMemory = function(base) {
    var body, c, col, html, r, row, v, _i, _j, _results;
    body = $("#memdump-body");
    body.empty();
    _results = [];
    for (r = _i = 0; _i <= 4; r = ++_i) {
      row = $("<tr><td>" + (dasm.Disasm.fmtHex(base + (r * 8))) + "</td></tr>");
      for (c = _j = 0; _j <= 7; c = ++_j) {
        v = cpu.readMem(base + (r * 8) + c);
        html = "<td>" + (dasm.Disasm.fmtHex(v)) + "</td>";
        col = $(html);
        row.append(col);
      }
      _results.push(body.append(row));
    }
    return _results;
  };

  assemble = function(text) {
    var state;
    state = new asm.Assembler().assemble(text);
    if (state.result !== "success") {
      return $("#asm-error").html("Error: Line " + state.line + ": " + state.message);
    }
    $("#asm-error").html("");
    cpu.loadBinary(state.code);
    cpu.regPC(0);
    return updateRegs();
  };

  run = function() {
    var cb;
    cb = function() {
      var i, _i;
      for (i = _i = 0; _i <= 20000; i = ++_i) {
        cpu.step();
      }
      updateRegs();
      return updateCycles();
    };
    if (timer) {
      clearInterval(timer);
    }
    return timer = setInterval(cb, 50);
  };

  $(function() {
    var btnAssembleClick, canvas, fb;
    regs = [$("#RegA"), $("#RegB"), $("#RegC"), $("#RegX"), $("#RegY"), $("#RegZ"), $("#RegI"), $("#RegJ"), $("#RegPC"), $("#RegSP"), $("#RegO")];
    btnAssembleClick = function() {
      var base;
      assemble(window.editor.getValue());
      base = $("#membase").val();
      if (!base) {
        return base = 0;
      }
    };
    updateRegs();
    updateDisasm();
    dumpMemory(0);
    btnAssembleClick();
    $("#btnStep").click(function() {
      cpu.step();
      return updateRegs();
    });
    $("#btnAssemble").click(btnAssembleClick);
    $("#membase").change(function() {
      var base;
      base = $("#membase").val();
      if (!base) {
        base = 0;
      }
      return dumpMemory(parseInt(base));
    });
    $("#btnRun").click(function() {
      return run();
    });
    $("#btnStop").click(function() {
      if (timer) {
        clearInterval(timer);
        return timer = null;
      }
    });
    canvas = $("#framebuffer")[0];
    fb = new lem1802.Lem1802(cpu, canvas);
    cpu.addDevice(fb);
    return updateCycles();
  });

}).call(this);
