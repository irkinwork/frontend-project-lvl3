export default class Container {
  constructor() {
    this.element = document.querySelector('.container');
    this.input = this.element.querySelector('#input');
    this.submit = this.element.querySelector('#submit');
    this.links = this.element.querySelectorAll('#example-links a');
    this.list = this.element.querySelector('#list');
  }

  addListenersToExampleLinks() {
    const { links, input, submit } = this;
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const { href } = link;
        input.value = href;
        submit.click();
        input.value = '';
      });
    });
  }

  renderInput(valid) {
    const { input } = this;
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
  }

  renderList(feeds) {
    this.list.innerHTML = `
      ${feeds.map(feed => `
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
  }
}
