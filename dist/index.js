"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  extractData: () => extractData
});
module.exports = __toCommonJS(src_exports);

// src/simplerreader.ts
var SimplerReader = class {
  constructor(pFile, startPos, littleEndian) {
    this.pos = startPos;
    this.file = new DataView(pFile);
    this.littleEndian = littleEndian;
  }
  readUint16() {
    this.pos += 2;
    return this.file.getUint16(this.pos - 2, this.littleEndian);
  }
  readUint32() {
    this.pos += 4;
    return this.file.getUint32(this.pos - 4, this.littleEndian);
  }
  readInt32() {
    this.pos += 4;
    return this.file.getInt32(this.pos - 4, this.littleEndian);
  }
  readFloat32() {
    this.pos += 4;
    const floatVal = this.file.getFloat32(this.pos - 4, this.littleEndian);
    return Math.round(floatVal * 1e5) / 1e5;
  }
  readByte() {
    this.pos += 1;
    return this.file.getUint8(this.pos - 1);
  }
  readString() {
    const len = this.readUint16();
    if (len === 0) {
      return "";
    } else if (len === 1) {
      return String.fromCharCode(this.readByte());
    } else {
      const strings = new Array(len);
      for (let c = 0; c < len; ++c) {
        strings[c] = String.fromCharCode(this.readByte());
      }
      let val = strings.join("");
      if (val && val.length > 6 && val.indexOf(".") > 0 && !isNaN(parseFloat(val))) {
        val = String(Math.round(Number(val) * 1e5) / 1e5);
      }
      return val;
    }
  }
  skipUint16() {
    this.pos += 2;
  }
  skipUint32() {
    this.pos += 4;
  }
  skipInt32() {
    this.pos += 4;
  }
  skipFloat32() {
    this.pos += 4;
  }
  skipByte() {
    this.pos += 1;
  }
  skipString() {
    const len = this.readUint16();
    this.pos += len;
  }
};
var simplerreader_default = SimplerReader;

// src/dntreader.ts
var DntReader = class {
  constructor() {
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
  // function to populate the object with the data in the dnt file
  processFile(arrayBuffer, fileName) {
    try {
      const start = (/* @__PURE__ */ new Date()).getTime();
      this.fileName = fileName;
      const reader = new simplerreader_default(arrayBuffer, 4, true);
      const readFuncs = [];
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
      const skipFuncs = [];
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
      const colReaders = [];
      const colIsRead = [];
      let colIndex = 1;
      let realNumCols = 0;
      for (let c = 1; c < this.numColumns; ++c) {
        const colName = reader.readString().substr(0);
        const colType = reader.readByte();
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
      for (let r = 0; r < this.numRows; ++r) {
        this.data[r] = new Array(realNumCols);
        this.data[r][0] = reader.readUint32();
        colIndex = 1;
        for (let c = 1; c < this.numColumns; ++c) {
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
      for (let c = 1; c < this.numColumns; ++c) {
        if (this.columnIndexes) {
        }
        this.columnIndexes[this.columnNames[c]] = c;
      }
      const end = (/* @__PURE__ */ new Date()).getTime();
      this.processTime = end - start;
      const dntData = {
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
  }
  getRow(index) {
    return this.convertData(this.data[index]);
  }
  convertData(d) {
    let item = { id: d[0] };
    for (var c = 1; c < this.numColumns; ++c) {
      if (d[c] != null) {
        item[this.columnNames[c]] = d[c];
      }
    }
    return item;
  }
  getValue(index, colName) {
    if (colName in this.columnIndexes) {
      const colIndex = this.columnIndexes[colName];
      if (colIndex !== void 0) {
        return this.data[index][colIndex];
      }
    }
    return null;
  }
};
var dntreader_default = DntReader;

// src/index.ts
var dntReader = new dntreader_default();
function extractData(buffer, fileName) {
  try {
    return dntReader.processFile(buffer, fileName);
  } catch (e) {
    console.error(e);
    return {
      data: [],
      columnNames: [],
      columnTypes: [],
      columnIndexes: { ["none"]: 0 },
      numRows: 0,
      numColumns: 0
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  extractData
});
