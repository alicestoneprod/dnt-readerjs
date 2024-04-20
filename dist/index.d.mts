interface DntData {
    data: any[];
    columnNames: string[];
    columnTypes: number[];
    columnIndexes: {
        [key: string]: number;
    };
    numRows: number;
    numColumns: number;
}

declare function extractData(buffer: ArrayBuffer, fileName: string): Partial<DntData>;

export { extractData };
