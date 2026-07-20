import React from 'react';
import ReactDOM from 'react-dom';
import Categories from './pages/categories'
import reportWebVitals from './reportWebVitals';
import './tailwind.css';
import './index.scss';

const themeName = 'indigo'

ReactDOM.render(
  <React.StrictMode>
    <div className='h-full w-full' data-theme={themeName}>
      <Categories />
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
