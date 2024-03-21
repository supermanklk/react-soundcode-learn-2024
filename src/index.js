// import * as MyReact from './MyReact/index.js';

// import './index.css';
// import App from './App';

// const element = MyReact.createElement(
//   'div',
//   { title: 'hello', id: 'sky', binbin: '3' },
//   'faith',
//   MyReact.createElement('a', { src: '111' }, '我是a标签'),
// );

// MyReact.render(element, document.getElementById('root'));

import { jsx } from 'react';
/** @jsxRuntime classic */

import * as MyReact from './MyReact/index.js';
import { Divider } from 'antd';

// 以下意思是告诉jsx，你在编译的时候用我们自己的方法
/** @jsx MyReact.createElement */

const container = document.querySelector('#root');

// const updateValue = (e) => {
//   const value = e.target.value;
//   renderder(value);
// };

// const renderder = (value) => {
//   const element = (
//     <div>
//       <input onInput={updateValue} value={value} />
//       <h2>{value}</h2>
//     </div>
//   );

//   MyReact.render(element, container);
// };

// renderder('嘿嘿');

function App() {
  const [number, setNumber] = MyReact.useState(0);
  const [visible, setVisible] = MyReact.useState(true);

  const handleAdd = () => {
    setNumber(number + 1);
    setVisible(!visible);
  };

  return (
    <div>
      <button onClick={handleAdd}>点击我</button>
      <h2>{number}</h2>

      {visible ? <h2>显示我是彬彬彬~</h2> : ''}
    </div>
  );
}

MyReact.render(<App />, container);
