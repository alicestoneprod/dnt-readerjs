interface SimplerReaderI {
  pos: number
  readUint16: () => number
  readUint32: () => number
  readInt32: () => number
  readFloat32: () => number
  readByte: () => number
  readString: () => string
  skipUint16: () => void
  skipUint32: () => void
  skipInt32: () => void
  skipFloat32: () => void
  skipByte: () => void
  skipString: () => void
}

class SimplerReader implements SimplerReaderI {
  pos: number
  file: DataView
  littleEndian: boolean

  constructor(pFile: ArrayBuffer, startPos: number, littleEndian: boolean) {
    this.pos = startPos
    this.file = new DataView(pFile)
    this.littleEndian = littleEndian
  }

  readUint16(): number {
    this.pos += 2
    return this.file.getUint16(this.pos - 2, this.littleEndian)
  }

  readUint32(): number {
    this.pos += 4
    return this.file.getUint32(this.pos - 4, this.littleEndian)
  }

  readInt32(): number {
    this.pos += 4
    return this.file.getInt32(this.pos - 4, this.littleEndian)
  }

  readFloat32(): number {
    this.pos += 4
    const floatVal = this.file.getFloat32(this.pos - 4, this.littleEndian)
    return floatVal
  }

  readFloat64(): number {
    this.pos += 8
    const doubleFloatValue = this.file.getFloat64(this.pos - 8, this.littleEndian)
    return doubleFloatValue
  }

  readByte(): number {
    this.pos += 1
    return this.file.getUint8(this.pos - 1)
  }

  readString(): string {
    let len = this.readUint16()
    if (len === 0) {
      return ""
    } else if (len === 1) {
      return String.fromCharCode(this.readByte())
    } else {
      let strings = new Array(len)
      for (let c = 0; c < len; ++c) {
        strings[c] = String.fromCharCode(this.readByte())
      }

      let val = strings.join("")
      if (val && val.length > 6 && val.indexOf(".") > 0 && !isNaN(parseInt(val))) {
        return val.toString()
      }

      return val
    }
  }

  skipUint16(): void {
    this.pos += 2
  }

  skipUint32(): void {
    this.pos += 4
  }

  skipInt32(): void {
    this.pos += 4
  }

  skipFloat32(): void {
    this.pos += 4
  }

  skipByte(): void {
    this.pos += 1
  }

  skipFloat64(): void {
    this.pos += 8
  }

  skipString(): void {
    const len = this.readUint16()
    this.pos += len
  }
}

export default SimplerReader
