import '@babel/polyfill';
import 'bootstrap/js/dist/modal';
import App from './App';

export default () => {
  const element = document.getElementById('point');
  const app = new App(element);
  app.init();
};
