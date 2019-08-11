import '@babel/polyfill';
import 'bootstrap/js/dist/modal';
import init from './App';

export default () => {
  const element = document.getElementById('point');
  init(element);
};
