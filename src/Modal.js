import $ from 'jquery';

export default class Modal {
  init() {
    this.exampleModal = $('#exampleModal');
    this.exampleModal.on('show.bs.modal', (event) => {
      const button = $(event.relatedTarget);
      const title = button.data('title');
      const description = button.data('description');
      const modalTarget = $(event.target);
      modalTarget.find('.modal-title').text(title);
      modalTarget.find('.modal-body').text(description);
    });
  }
}
