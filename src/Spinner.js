import $ from 'jquery/dist/jquery.slim.min';

export default class Spinner {
  get template() {
    this.element = document.createElement('div');
    this.element.classList.add('spinner');
    this.element.innerHTML = `<div class="bg-white fixed-top h-100 w-100 d-flex align-items-center justify-content-center"><div class="spinner-border text-info p-4" role="status">
    <span class="sr-only">Loading...</span>
  </div></div>`;
    return this.element;
  }

  hide() {
    this.elementDOM = $('.spinner');
    this.elementDOM.hide();
  }
}
