import React from 'react';
import { render as reactDOMRender } from 'react-dom';
import CellsList from './CellsList';
// Global styles
import '../stylesheets/index.css';

// https://redivis.com/Demo/datasets/1667/tables?table=74304
const TABLE_IDENTIFIER = 'demo.us_fires:9:v1_0.us_fires_compiled_dataset:1';

let root = document.getElementById('root');

if (!root) {
	root = document.createElement('div');
	root.id = 'root';

	document.body.appendChild(root);
}

async function fetchTableAndRender() {
	const tableResponse = await fetch(`https://redivis.com/api/v1/tables/${TABLE_IDENTIFIER}`, {
		headers: {
			Authorization: `Bearer ${process.env.API_ACCESS_TOKEN}`,
		},
	});
	const table = await tableResponse.json();
	const variablesResponse = await fetch(
		`https://redivis.com/api/v1/tables/${TABLE_IDENTIFIER}/variables?maxResults=999`,
		{
			headers: {
				Authorization: `Bearer ${process.env.API_ACCESS_TOKEN}`,
			},
		},
	);

	const parsedResult = await variablesResponse.json();
	const variables = parsedResult.results;

	reactDOMRender(
		<CellsList
			variables={variables}
			rowCount={parseInt(table.numRows, 10)} // This comes down as a string to support 64-bit ints
			rowHeight={30}
			width={document.body.clientWidth}
			height={document.body.clientHeight}
			tableIdentifier={TABLE_IDENTIFIER}
		/>,
		root,
	);
}

fetchTableAndRender().catch(console.error);
