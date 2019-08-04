export default class Container {
  constructor() {
    this.element = document.querySelector('.container');
  }

  addListenersToExampleLinks() {
    const links = this.element.querySelectorAll('#example-links a');
    const input = this.element.querySelector('#input');
    const submit = this.element.querySelector('#submit');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const { href } = link;
        input.value = href;
        submit.click();
      });
    });
  }

  renderInput(valid) {
    this.input = this.element.querySelector('#input');
    if (valid) {
      this.input.classList.remove('alert-danger');
      this.input.classList.add('alert-dark');
      this.input.placeholder = 'Enter RSS link';
    } else {
      this.input.classList.remove('alert-dark');
      this.input.classList.add('alert-danger');
      this.input.placeholder = 'Invalid link';
    }
    this.input.value = '';
  }

  renderList(feeds) {
    this.element.querySelector('#list').innerHTML = `
      ${feeds.map(feed => `
        <div class="feed">
            <h5>${feed.headerTitle}</h5>
            <p>${feed.headerDescription}</p>
            <div class="content">
              ${feed.items.map(item => `<div class="item mb-1 mt-1 d-flex align-items-center">
                <button tabindex="0"  type="button" class="btnModal btn-sm btn btn-info pt-2 pb-2 mr-2" data-toggle="modal" data-target="#exampleModal" data-description="${item.description}" data-title="${item.title}">
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
