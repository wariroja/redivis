import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { VariableSizeGrid as Grid } from 'react-window';

import TableCache from './TableCache';
import styles from './CellsList.css';

const MAX_CHARACTERS_PER_CELL = 65;

export default class CellsList extends Component {
	static propTypes = {
		rowHeight: PropTypes.number,
		width: PropTypes.number,
		height: PropTypes.number,
		tableIdentifier: PropTypes.string,
		variables: PropTypes.arrayOf(PropTypes.object),
		rowCount: PropTypes.number,
	};

	static defaultProps = {
		variables: [],
	};

	constructor(props) {
		super(props);
		const { tableIdentifier, variables, rowCount } = props;
		this.tableCache = new TableCache({
			onForceUpdate: this.handleForceUpdate,
			onResetColumnMeasurements: this.handleResetColumnMeasurements,
			tableIdentifier,
			variables,
			rowCount,
		});
		this.gridRef = React.createRef();
	}

	// This is called when new data comes into the cache that necessitates a column resize
	handleResetColumnMeasurements = (index = 0) => {
		if (this.gridRef.current) {
			this.gridRef.current.resetAfterColumnIndex(index);
		}
	};

	handleHeaderClick = ({ event, columnIndex }) => {
		// Might be cool to do something here later...
	};

	handleForceUpdate = () => {
		this.forceUpdate();
	};

	renderHeaderCell = ({ variable: { name } = {}, style, rowIndex, columnIndex }) => {
		return (
			<div
				key={`${rowIndex}${columnIndex}`}
				style={style}
				className={`${styles.cell} ${styles.headerCell}`}
				onClick={(event) => {
					this.handleHeaderClick({ event, columnIndex });
				}}
			>
				{name}
			</div>
		);
	};

	renderCell = ({ value, isLoading, style, rowIndex, columnIndex, isSelected }) => {
		if (value) {
			// replace whitespace with dot for legibility
			value = value.replace(/\s/g, '·');
		}

		if (value?.length > MAX_CHARACTERS_PER_CELL) {
			value = `${value.slice(0, MAX_CHARACTERS_PER_CELL - 3)}...`;
		}

		return (
			<div
				key={`${rowIndex}${columnIndex}`}
				style={style}
				title={isLoading ? '' : value}
				className={`${styles.cell} ${isSelected ? styles.selected : ''}`}
			>
				{isLoading ? '...' : value || <span className={styles.nullValue}>{'Null'}</span>}
			</div>
		);
	};

	render() {
		const { width, height, variables, rowCount } = this.props;
		return (
			<div className={styles.cellListWrapper}>
				<Grid
					ref={this.gridRef}
					columnCount={variables.length}
					rowCount={rowCount + 1} // Add 1 for the header column
					columnWidth={this.tableCache.getColumnWidth}
					rowHeight={this.tableCache.getRowHeight}
					width={width}
					height={height}
				>
					{({ columnIndex, rowIndex, style }) => {
						const cellData = this.tableCache.getValue({ rowIndex, columnIndex });
						if (rowIndex === 0) {
							return this.renderHeaderCell({
								...cellData,
								columnIndex,
								style,
							});
						} else {
							return this.renderCell({
								...cellData,
								rowIndex,
								columnIndex,
								style,
							});
						}
					}}
				</Grid>
			</div>
		);
	}
}
