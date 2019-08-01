export default class Container {
  get template() {
    this.element = document.createElement('div');
    this.element.classList.add('container');
    this.element.innerHTML = `
      <div id="example-links" class="alert alert-info w-100">
        Example RSS links (to click and add): 
        <a href="https://ru.hexlet.io/lessons.rss">Hexlet Lessons</a>, 
        <a href="https://ru.hexlet.io/blog.rss">Hexlet Blog</a>, 
        <a href="http://lorem-rss.herokuapp.com/feed?unit=second&interval=1">Lorem RSS 1 sec</a>,
        <a href="http://lorem-rss.herokuapp.com/feed?unit=minute&interval=1">Lorem RSS 1 min</a>,
        <a href="http://feeds.bbci.co.uk/news/rss.xml">BBC News</a>
      </div>
      <div class="jumbotron pb-4 pt-4">
        <div class="input-group"></div>
      </div>
      <div id="list"></div>
      `;
    return this.element;
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

  renderInputGroup(valid) {
    this.input = this.element.querySelector('.input-group');
    this.input.outerHTML = `
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text" id="basic-addon1">Insert your RSS link</span>
        </div>
        <input type="text" id="input" class="form-control alert-${valid ? 'dark' : 'danger'}" placeholder="${valid ? 'Enter RSS link' : 'Invalid link'}" aria-label="RSS Link" aria-describedby="basic-addon1">
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
