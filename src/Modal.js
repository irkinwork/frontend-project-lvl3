import $ from 'jquery';

export default class Modal {
  constructor() {
    this.element = $('#infoModal');
  }

  addListeners() {
    this.element.on('show.bs.modal', (event) => {
      const button = $(event.relatedTarget);
      const title = button.data('title');
      const description = button.data('description');
      const modalTarget = $(event.target);
      modalTarget.find('.modal-title').text(title);
      modalTarget.find('.modal-body').text(description);
    });
    this.element.on('error', (event, code, url) => {
      const modalTarget = $(event.target);
      modalTarget.find('.modal-title').text(`${code} Error`);
      modalTarget.find('.modal-body').text(`Couldn't get RSS feed: ${url}`);
    });
  }
}
