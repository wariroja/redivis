import React from 'react';
// Global styles
import '../stylesheets/index.css';

let root = document.getElementById('root');

if (!root) {
	root = document.createElement('div');
	root.id = 'root';

	document.body.appendChild(root);
}
