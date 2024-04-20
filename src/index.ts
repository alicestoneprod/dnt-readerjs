import DntReader, { DntData } from "./dntreader.js"

const dntReader = new DntReader()

function extractData(buffer: ArrayBuffer, fileName: string): Partial<DntData> {
  try {
    return dntReader.processFile(buffer, fileName)
  } catch (e) {
    console.error(e)
    return {
      data: [],
      columnNames: [],
      columnTypes: [],
      columnIndexes: { ["none"]: 0 },
      numRows: 0,
      numColumns: 0,
    }
  }
}

export default extractData
