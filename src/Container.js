export default class Example {
  constructor(element) {
    this.element = element;
  }

  init() {
    this.element.innerHTML = `
    <div class="container">
      <div class="jumbotron">
        <h1 class="display-4">RSS Feader</h1>
        <div class="input-group mb-4 mt-4">
          <div class="input-group-prepend">
            <span class="input-group-text" id="basic-addon1">Insert your RSS link</span>
          </div>
          <input type="text" class="form-control" placeholder="RSS Link" aria-label="RSS Link" aria-describedby="basic-addon1">
        </div>
        <a class="btn btn-primary btn-lg" href="#" role="button">Get RSS feed</a>
      </div>
    </div>`;
  }
}
