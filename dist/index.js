"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// simplerreader.js
var require_simplerreader = __commonJS({
  "simplerreader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var SimplerReader = (
      /** @class */
      function() {
        function SimplerReader2(pFile, startPos, littleEndian) {
          this.pos = startPos;
          this.file = new DataView(pFile);
          this.littleEndian = littleEndian;
        }
        SimplerReader2.prototype.readUint16 = function() {
          this.pos += 2;
          return this.file.getUint16(this.pos - 2, this.littleEndian);
        };
        SimplerReader2.prototype.readUint32 = function() {
          this.pos += 4;
          return this.file.getUint32(this.pos - 4, this.littleEndian);
        };
        SimplerReader2.prototype.readInt32 = function() {
          this.pos += 4;
          return this.file.getInt32(this.pos - 4, this.littleEndian);
        };
        SimplerReader2.prototype.readFloat32 = function() {
          this.pos += 4;
          var floatVal = this.file.getFloat32(this.pos - 4, this.littleEndian);
          return Math.round(floatVal * 1e5) / 1e5;
        };
        SimplerReader2.prototype.readByte = function() {
          this.pos += 1;
          return this.file.getUint8(this.pos - 1);
        };
        SimplerReader2.prototype.readString = function() {
          var len = this.readUint16();
          if (len === 0) {
            return "";
          } else if (len === 1) {
            return String.fromCharCode(this.readByte());
          } else {
            var strings = new Array(len);
            for (var c = 0; c < len; ++c) {
              strings[c] = String.fromCharCode(this.readByte());
            }
            var val = strings.join("");
            if (val && val.length > 6 && val.indexOf(".") > 0 && !isNaN(parseFloat(val))) {
              val = String(Math.round(Number(val) * 1e5) / 1e5);
            }
            return val;
          }
        };
        SimplerReader2.prototype.skipUint16 = function() {
          this.pos += 2;
        };
        SimplerReader2.prototype.skipUint32 = function() {
          this.pos += 4;
        };
        SimplerReader2.prototype.skipInt32 = function() {
          this.pos += 4;
        };
        SimplerReader2.prototype.skipFloat32 = function() {
          this.pos += 4;
        };
        SimplerReader2.prototype.skipByte = function() {
          this.pos += 1;
        };
        SimplerReader2.prototype.skipString = function() {
          var len = this.readUint16();
          this.pos += len;
        };
        return SimplerReader2;
      }()
    );
    exports2.default = SimplerReader;
  }
});

// dntreader.js
var require_dntreader = __commonJS({
  "dntreader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var simplerreader_js_1 = require_simplerreader();
    var DntReader2 = (
      /** @class */
      function() {
        function DntReader3() {
          "use strict";
          this.data = [];
          this.columnNames = [];
          this.columnTypes = [];
          this.columnIndexes = {};
          this.numRows = 0;
          this.numColumns = 0;
          this.fileName = "";
          this.colsToLoad = null;
          this.processTime = 0;
        }
        DntReader3.prototype.processFile = function(arrayBuffer, fileName) {
          try {
            var start = (/* @__PURE__ */ new Date()).getTime();
            this.fileName = fileName;
            var reader = new simplerreader_js_1.default(arrayBuffer, 4, true);
            var readFuncs = [];
            readFuncs[1] = function(reader2) {
              return reader2.readString();
            };
            readFuncs[2] = function(reader2) {
              return reader2.readInt32();
            };
            readFuncs[3] = function(reader2) {
              return reader2.readInt32();
            };
            readFuncs[4] = function(reader2) {
              return reader2.readFloat32();
            };
            readFuncs[5] = function(reader2) {
              return reader2.readFloat32();
            };
            var skipFuncs = [];
            skipFuncs[1] = function(reader2) {
              reader2.skipString();
            };
            skipFuncs[2] = function(reader2) {
              reader2.skipInt32();
            };
            skipFuncs[3] = function(reader2) {
              reader2.skipInt32();
            };
            skipFuncs[4] = function(reader2) {
              reader2.skipFloat32();
            };
            skipFuncs[5] = function(reader2) {
              reader2.skipFloat32();
            };
            this.numColumns = reader.readUint16() + 1;
            this.numRows = reader.readUint32();
            this.data = new Array(this.numRows);
            this.columnNames = new Array(this.numColumns);
            this.columnTypes = new Array(this.numColumns);
            this.columnNames[0] = "id";
            this.columnTypes[0] = 3;
            var colReaders = [];
            var colIsRead = [];
            var colIndex = 1;
            var realNumCols = 0;
            for (var c = 1; c < this.numColumns; ++c) {
              var colName = reader.readString().substr(1);
              var colType = reader.readByte();
              if (this.colsToLoad === null || this.colsToLoad[colName]) {
                colIsRead[c] = true;
                colReaders[c] = readFuncs[colType];
                this.columnNames[colIndex] = colName;
                this.columnTypes[colIndex] = colType;
                colIndex++;
              } else {
                colIsRead[c] = false;
                colReaders[c] = skipFuncs[colType];
              }
            }
            realNumCols = colIndex;
            for (var r = 0; r < this.numRows; ++r) {
              this.data[r] = new Array(realNumCols);
              this.data[r][0] = reader.readUint32();
              colIndex = 1;
              for (var c = 1; c < this.numColumns; ++c) {
                if (colIsRead[c]) {
                  this.data[r][colIndex] = colReaders[c](reader);
                  colIndex++;
                } else {
                  colReaders[c](reader);
                }
              }
            }
            this.numColumns = realNumCols;
            this.columnIndexes = { id: 0 };
            for (var c = 1; c < this.numColumns; ++c) {
              if (this.columnIndexes) {
              }
              this.columnIndexes[this.columnNames[c]] = c;
            }
            var end = (/* @__PURE__ */ new Date()).getTime();
            this.processTime = end - start;
            var dntData = {
              data: this.data,
              columnNames: this.columnNames,
              columnTypes: this.columnTypes,
              columnIndexes: this.columnIndexes,
              numRows: this.numRows,
              numColumns: this.numColumns
            };
            return dntData;
          } catch (e) {
            console.error(e);
            return {
              data: this.data,
              columnNames: this.columnNames,
              columnTypes: this.columnTypes,
              columnIndexes: this.columnIndexes,
              numRows: this.numRows,
              numColumns: this.numColumns
            };
          }
        };
        DntReader3.prototype.getRow = function(index) {
          return this.convertData(this.data[index]);
        };
        DntReader3.prototype.convertData = function(d) {
          var item = { id: d[0] };
          for (var c = 1; c < this.numColumns; ++c) {
            if (d[c] != null) {
              item[this.columnNames[c]] = d[c];
            }
          }
          return item;
        };
        DntReader3.prototype.getValue = function(index, colName) {
          if (colName in this.columnIndexes) {
            var colIndex = this.columnIndexes[colName];
            if (colIndex !== void 0) {
              return this.data[index][colIndex];
            }
          }
          return null;
        };
        return DntReader3;
      }()
    );
    exports2.default = DntReader2;
  }
});

// index.ts
var dntreader_nodejs_exports = {};
__export(dntreader_nodejs_exports, {
  default: () => dntreader_nodejs_default
});
module.exports = __toCommonJS(dntreader_nodejs_exports);
var import_dntreader = __toESM(require_dntreader());
var dntReader = new import_dntreader.default();
function extractData(buffer, fileName) {
  try {
    return dntReader.processFile(buffer, fileName);
  } catch (e) {
    console.error(e);
  }
}
var dntreader_nodejs_default = extractData;
