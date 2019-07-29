export default class Container {
  get template() {
    this.element = document.createElement('div');
    this.element.classList.add('container');
    this.element.innerHTML = `
      <div class="jumbotron pb-4 pt-4">
          <div class="input-group"></div>
      </div>
      <div id="list"></div>`;
    return this.element;
  }

  renderInputGroup(valid) {
    this.input = this.element.querySelector('.input-group');
    this.input.outerHTML = `
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon1">Insert your RSS link</span>
      </div>
      <input type="text" id="input" class="form-control alert-${valid ? 'dark' : 'danger'}" placeholder="RSS Link" aria-label="RSS Link" aria-describedby="basic-addon1">
      <div class="input-group-append">
        <button class="btn btn-outline-secondary" id="submit" role="button">Get RSS</button>
      </div>
    </div>`;
  }

  renderList(feeds) {
    this.element.querySelector('#list').innerHTML = `
      ${feeds.map(feed => `
        <div class="feed">
            <h5>${feed.headerTitle}</h5>
            <p>${feed.headerDescription}</p>
            <div class="content">
              ${feed.items.map(item => `<div class="item mb-1 mt-1">
                <button tabindex="0"  type="button" class="btnModal btn-sm btn btn-info" data-toggle="modal" data-target="#exampleModal" data-description="${item.description}" data-title="${item.title}">
                <i class="fas fa-info"></i>
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
