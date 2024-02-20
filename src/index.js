// import React from 'react'
// import ReactDOM from 'react-dom'

import * as MyReact from './MyReact/index.js';

import './index.css';
import App from './App';

// const element = React.createElement('div', { title: 'hello', id: 'sky' }, 'faith', React.createElement('a', { src: '111' }, '我是a标签'))

const element = MyReact.createElement(
  'div',
  { title: 'hello', id: 'sky', binbin: '3' },
  'faith',
);

console.log('faith=============element', element);

// const root = ReactDOM.createRoot(document.getElementById('root'))
// root.render(element)

MyReact.render(element, document.getElementById('root'));
