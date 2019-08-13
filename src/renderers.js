export const renderList = (feedList, listId, doc) => {
  const list = doc.querySelector(listId);
  list.innerHTML = `
    ${feedList.map(feed => `
      <div class="feed">
          <h5>${feed.headerTitle}</h5>
          <p>${feed.headerDescription}</p>
          <div class="content">
            ${feed.items.map(item => `<div class="item mb-1 mt-1 d-flex align-items-center">
              <button tabindex="0"  type="button" class="btnModal btn-sm btn btn-info pt-2 pb-2 mr-2" data-toggle="modal" data-target="#infoModal" data-description="${item.description}" data-title="${item.title}">
              </button>
              <a href="${item.link}" target="_blank">${item.title}</a>
              </div>`).join('')}
          </div>
        <hr>
        </div>`).join('')}
      </div>
    </div>`;
};

export const renderInput = (valid, inputId, doc) => {
  const input = doc.querySelector(inputId);
  if (valid) {
    input.classList.remove('alert-danger');
    input.classList.add('alert-dark');
    input.placeholder = 'Enter RSS link';
  } else {
    input.classList.remove('alert-dark');
    input.classList.add('alert-danger');
    input.placeholder = 'Invalid link';
  }
  input.value = '';
};

export const renderModal = (target, title, description) => {
  const titleElement = target.find('.modal-title');
  const descriptionElement = target.find('.modal-body');
  titleElement.text(title);
  descriptionElement.text(description);
};
