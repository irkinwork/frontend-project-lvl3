import $ from 'jquery';

export default class Modal {
  get template() {
    this.element = document.createElement('div');
    this.element.classList.add('modal-wrapper');
    this.element.innerHTML = `<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel"></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
          <div class="modal-body"></div>
        </div>
      </div>
    </div>`;
    return this.element;
  }

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
