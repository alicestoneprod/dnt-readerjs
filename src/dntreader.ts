import SimplerReader from "./simplerreader.js"

export interface DntData {
  data: any[]
  columnNames: string[]
  columnTypes: number[]
  columnIndexes: { [key: string]: number }
  numRows: number
  numColumns: number
}

class DntReader {
  data: any[]
  columnNames: string[]
  columnTypes: number[]
  columnIndexes: { [key: string]: number }
  numRows: number
  numColumns: number
  fileName: string
  colsToLoad: any
  processTime: number

  constructor() {
    // module for to allow reading of dnt data from dnt files
    // right now this simply loads the whole file into the data property
    // data is an array of objects eg [{id: "123",NameParam: "456"}]
    "use strict"

    this.data = []
    this.columnNames = []
    this.columnTypes = []
    this.columnIndexes = {}
    this.numRows = 0
    this.numColumns = 0
    this.fileName = ""
    this.colsToLoad = null
    this.processTime = 0
  }

  // function to populate the object with the data in the dnt file
  processFile(arrayBuffer: ArrayBuffer, fileName: string): Partial<DntData> {
    try {
      const start = new Date().getTime()

      this.fileName = fileName

      // not sure if littleEndian should always be true or when it would be false
      const reader = new SimplerReader(arrayBuffer, 4, true)

      const readFuncs = []
      readFuncs[1] = function (reader: SimplerReader) {
        return reader.readString()
      }
      readFuncs[2] = function (reader: SimplerReader) {
        return reader.readInt32()
      }
      readFuncs[3] = function (reader: SimplerReader) {
        return reader.readInt32()
      }
      readFuncs[4] = function (reader: SimplerReader) {
        return reader.readFloat32()
      }
      readFuncs[5] = function (reader: SimplerReader) {
        return reader.readFloat32()
      }

      const skipFuncs = []
      skipFuncs[1] = function (reader: SimplerReader) {
        reader.skipString()
      }
      skipFuncs[2] = function (reader: SimplerReader) {
        reader.skipInt32()
      }
      skipFuncs[3] = function (reader: SimplerReader) {
        reader.skipInt32()
      }
      skipFuncs[4] = function (reader: SimplerReader) {
        reader.skipFloat32()
      }
      skipFuncs[5] = function (reader: SimplerReader) {
        reader.skipFloat32()
      }

      this.numColumns = reader.readUint16() + 1
      this.numRows = reader.readUint32()

      this.data = new Array(this.numRows)
      this.columnNames = new Array(this.numColumns)
      this.columnTypes = new Array(this.numColumns)

      this.columnNames[0] = "id"
      this.columnTypes[0] = 3
      const colReaders = []
      const colIsRead = []
      let colIndex = 1
      let realNumCols = 0

      for (let c = 1; c < this.numColumns; ++c) {
        let colName = reader.readString().substr(0)
        let colType = reader.readByte()

        if (this.colsToLoad === null || this.colsToLoad[colName]) {
          colIsRead[c] = true
          colReaders[c] = readFuncs[colType]

          this.columnNames[colIndex] = colName
          this.columnTypes[colIndex] = colType
          colIndex++
        } else {
          colIsRead[c] = false
          colReaders[c] = skipFuncs[colType]
        }
      }
      realNumCols = colIndex

      for (let r = 0; r < this.numRows; ++r) {
        this.data[r] = new Array(realNumCols)
        this.data[r][0] = reader.readUint32()

        colIndex = 1
        for (let c = 1; c < this.numColumns; ++c) {
          if (colIsRead[c]) {
            // @ts-ignore
            this.data[r][colIndex] = colReaders[c](reader)
            colIndex++
          } else {
            // @ts-ignore
            colReaders[c](reader)
          }
        }
      }

      this.numColumns = realNumCols

      this.columnIndexes = { id: 0 }
      for (let c = 1; c < this.numColumns; ++c) {
        // @ts-ignore
        this.columnIndexes[this.columnNames[c]] = c
      }

      const dntData = {
        data: this.data,
        columnNames: this.columnNames,
        columnTypes: this.columnTypes,
        columnIndexes: this.columnIndexes,
        numRows: this.numRows,
        numColumns: this.numColumns,
      }

      return dntData
    } catch (e) {
      throw new Error("An error occurred while reading .DNT")
    }
  }
}

export default DntReader
