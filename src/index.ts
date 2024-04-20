import DntReader, { DntData } from "./dntreader.js"

const dntReader = new DntReader()

function extractData(buffer: ArrayBuffer, fileName: string): Partial<DntData> | void {
  try {
    return dntReader.processFile(buffer, fileName)
  } catch (e) {
    console.error(e)
  }
}

export default extractData
