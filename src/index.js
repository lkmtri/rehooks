import raf from 'raf';
import React from 'react';
import ReactDOM from 'react-dom';

import './styles.css';

function useWindowEvents(event, handler, useCapture) {
  React.useEffect(
    () => {
      window.addEventListener(event, handler, useCapture);
      return () => window.removeEventListener(event, handler);
    },
    [event, handler]
  );
}

function observeRect(node, callback) {
  const props = ['width', 'height', 'top', 'right', 'bottom', 'left'];
  const isRectChanged = (a = {}, b = {}) =>
    props.some(prop => a[prop] !== b[prop]);

  let rect = {};

  const tick = () => {
    const newRect = node.getBoundingClientRect();
    if (isRectChanged(rect, newRect)) {
      rect = newRect;
      callback(newRect);
    }
    raf(tick);
  };

  const rafId = raf(tick);

  return () => raf.cancel(rafId);
}

function useObserveRect(ref, callback) {
  React.useEffect(
    () => {
      if (ref.current) {
        return observeRect(ref.current, callback);
      }
    },
    [ref, callback]
  );
}

function useInterval(callback, timeout) {
  const [play, setPlay] = React.useState(true);

  React.useEffect(
    () => {
      if (play) {
        const interval = setInterval(callback, timeout);
        return () => clearInterval(interval);
      }
    },
    [timeout, callback, play]
  );

  return [play, setPlay];
}

function useInput(initialValue = '') {
  const [value, setValue] = React.useState(initialValue);
  const onChange = e => setValue(e.target.value);
  return { value, onChange };
}

function App() {
  const [counter, setCounter] = React.useState(0);
  const [size, setSize] = React.useState({});
  const ref = React.useRef();

  const increaseCounter = () => setCounter(counter + 1);

  useWindowEvents('mousedown', increaseCounter);

  useObserveRect(ref, setSize);

  const inputProps = useInput(1000);

  const [play, setPlay] = useInterval(increaseCounter, inputProps.value);

  return (
    <div ref={ref} className="App">
      <h1>Hello CodeSandbox</h1>
      <span>{counter}</span>
      <span>{JSON.stringify(size)}</span>
      <input {...inputProps} type="number" />
      <button onClick={() => setPlay(!play)}>Toggle</button>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
