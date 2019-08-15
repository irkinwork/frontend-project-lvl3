import '@babel/polyfill';
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/alert';
import init from './app';

export default () => {
  const element = document.getElementById('point');
  init(element);
};
