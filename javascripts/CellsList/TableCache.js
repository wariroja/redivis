import ndjsonStream from 'can-ndjson-stream';
const ROW_HEIGHT = 30;
const MIN_CELL_WIDTH = 50;
const MAX_CELL_WIDTH = 500;

// These constants specify how many rows/cols to load per fetch to the server
const CHUNK_COLUMN_COUNT = 50;
const CHUNK_ROW_COUNT = 100;

/*
	The TableCache class is used to store, and fetch as required, data to render within the CellsList component.
	We take an approach where we only load chunks of data (CHUNK_ROW_COUNT x CHUNK_COLUMN_COUNT) to avoid fetching
	  more data than is being shown on the user's screen.
 */
export default class TableCache {
	constructor({ onForceUpdate, onResetColumnMeasurements, rowCount, tableIdentifier, variables } = {}) {
		this.cache = [[]];
		this.loadingChunkMap = [[]];
		this.variables = variables;
		this.columnWidths = [];
		this.rowCount = rowCount;
		this.onForceUpdate = onForceUpdate;
		this.onResetColumnMeasurements = onResetColumnMeasurements;
		this.tableIdentifier = tableIdentifier;

		this.columnWidths = variables.map(({ name }) => {
			return Math.min(
				MAX_CELL_WIDTH,
				name.length * 7.3 + 20, // 7.3 font size, + 10x2 px padding
			);
		});
	}

	getRowHeight = (index) => {
		return ROW_HEIGHT;
	};

	getColumnWidth = (index) => {
		return this.columnWidths[index] || MIN_CELL_WIDTH;
	};

	// Called for each cell in the grid. If no data has been loaded, will call #fetchData
	getValue = ({ rowIndex, columnIndex }) => {
		const currentColumnSegmentIndex = columnIndex - (columnIndex % CHUNK_COLUMN_COUNT);
		const currentRowSegmentIndex = rowIndex - (rowIndex % CHUNK_ROW_COUNT);

		if (
			// If there's still another chunk to the right
			currentColumnSegmentIndex + CHUNK_COLUMN_COUNT < this.variables.length &&
			// and we're at least halfway through the current chunk
			columnIndex - currentColumnSegmentIndex > CHUNK_COLUMN_COUNT / 2
		) {
			// and the next data chunk hasn't yet been loaded
			if (
				rowIndex > 0 && // rowIndex == 0 means we only want the variable
				(this.cache[rowIndex - 1] === undefined ||
					this.cache[rowIndex - 1][currentColumnSegmentIndex + CHUNK_COLUMN_COUNT] === undefined)
			) {
				// preload next data
				this.#fetchData({
					rowStart: currentRowSegmentIndex,
					rowEnd: currentRowSegmentIndex + CHUNK_ROW_COUNT,
					columnStart: currentColumnSegmentIndex + CHUNK_COLUMN_COUNT,
					columnEnd: currentColumnSegmentIndex + CHUNK_COLUMN_COUNT * 2,
				});
			}
		}

		if (
			// If there's still another chunk below us
			currentRowSegmentIndex + CHUNK_ROW_COUNT < this.rowCount &&
			// and we're at least halfway through the current chunk
			rowIndex - currentRowSegmentIndex > CHUNK_ROW_COUNT / 2 &&
			// and the next chunk hasn't yet been loaded
			(this.cache[rowIndex + CHUNK_ROW_COUNT - 1] === undefined ||
				this.cache[rowIndex + CHUNK_ROW_COUNT - 1][columnIndex] === undefined)
		) {
			// preload the next chunk
			this.#fetchData({
				rowStart: currentRowSegmentIndex + CHUNK_ROW_COUNT,
				rowEnd: currentRowSegmentIndex + CHUNK_ROW_COUNT * 2,
				columnStart: currentColumnSegmentIndex,
				columnEnd: currentColumnSegmentIndex + CHUNK_COLUMN_COUNT,
			});
		}

		if (rowIndex === 0) {
			// Header row
			return {
				variable: this.variables[columnIndex],
				value: this.variables[columnIndex].name,
			};
		} else {
			if (this.cache[rowIndex - 1] && this.cache[rowIndex - 1][columnIndex] !== undefined) {
				return {
					value: this.cache[rowIndex - 1][columnIndex],
					variable: this.variables[columnIndex],
				};
			} else {
				this.#fetchData({
					rowStart: currentRowSegmentIndex,
					rowEnd: currentRowSegmentIndex + CHUNK_ROW_COUNT,
					columnStart: currentColumnSegmentIndex,
					columnEnd: currentColumnSegmentIndex + CHUNK_COLUMN_COUNT,
				});
				return { isLoading: true };
			}
		}
	};

	// Private method that updates the cache with new rows of data, triggering a column resize if necessary
	#handleUpdateCache = ({ rows, rowStart, rowEnd, columnStart, columnEnd }) => {
		let shouldRerenderWidths = false;
		for (let i = rowStart; i < Math.min(rowEnd, this.rowCount, rowStart + rows.length); i++) {
			if (!this.cache[i]) {
				this.cache[i] = [];
			}
			for (let j = columnStart; j < Math.min(columnEnd, this.variables.length); j++) {
				const value = rows[i - rowStart][j - columnStart];
				this.cache[i][j] = value;

				if (value) {
					let length = value.length;

					const nextWidth = Math.min(
						MAX_CELL_WIDTH,
						Math.max(this.columnWidths[j] || 0, length * 7.3 + 20), // 7.3 font size, + 10x2 px padding
					);
					if (nextWidth !== this.columnWidths[columnStart + j]) {
						shouldRerenderWidths = true;
						this.columnWidths[j] = nextWidth;
					}
				}
			}
		}
		if (shouldRerenderWidths) {
			this.onResetColumnMeasurements(columnStart);
		}
	};

	// Fetch a chunk of data from the API
	#fetchData = async ({ rowStart, rowEnd, columnStart, columnEnd }) => {
		// If we're already fetching for this chunk, we shouldn't fetch again
		if (this.loadingChunkMap[rowStart] && this.loadingChunkMap[rowStart][columnStart]) return;

		columnEnd = Math.min(columnEnd, this.variables.length);
		rowEnd = Math.min(rowEnd, this.rowCount);
		try {
			if (!this.loadingChunkMap[rowStart]) this.loadingChunkMap[rowStart] = [];
			// The loadingChunkMap stores which chunks are currently being fetched, to avoid fetching the same chunk twice
			this.loadingChunkMap[rowStart][columnStart] = true;

			const rows = await rowGetter({
				tableIdentifier: this.tableIdentifier,
				variables: this.variables,
				rowStart,
				rowEnd,
				columnStart,
				columnEnd,
			});

			this.loadingChunkMap[rowStart][columnStart] = false;
			this.#handleUpdateCache({ rows, rowStart, rowEnd, columnStart, columnEnd });
			// When new data comes in, we need to force React to re-render so that we can display the cells
			this.onForceUpdate();
		} catch (e) {
			console.error(e);
		}
	};
}

// Returns a 2-dimensional array of rows x columns for the chunk of data specified by row/column start/end
async function rowGetter({ tableIdentifier, variables, rowStart, rowEnd, columnStart, columnEnd }) {
	/*
		TODO: This method should call the Redivis API to fetch and process real data. Right now it's just
		 	  displaying dummy data. See issue #3 for more info.
	 */

	//Generates a string of comma separated variables to be used as selectedVariables's query value
	const variablesArr = [];
	let currentVariable;
	for (let i = 0; i < variables.length; i++) {
		currentVariable = variables[i].name;
		variablesArr.push(currentVariable);
	}
	const variablesStr = variablesArr.join(',');

	//Fetches rows data using tableIdentifier and variableStr variables
	const rowsResponse = await fetch(
		`https://redivis.com/api/v1/tables/${tableIdentifier}/rows?selectedVariables=${variablesStr}`,
		{
			headers: {
				Authorization: `Bearer ${process.env.API_ACCESS_TOKEN}`,
			},
		},
	);
	
	//Parses incoming NDJSON data using npm package: can-ndjson-stream
	const rowsReader = ndjsonStream(rowsResponse.body).getReader();
	let result;
	const rowsData = [];
	while (true) {
		result = await rowsReader.read();
		if (!result || !result.done) {
			rowsData.push(result.value); //result.value is one line of the NDJSON data
		} else {
			break;
		}
	}
	return rowsData;
}
