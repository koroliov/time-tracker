'use strict';

class CustomElement extends HTMLElement {
  constructor(data) {
    super();
    this.parent = data?.parent || null;
    this.attachShadow({mode: 'open',});
    const content = document.getElementById('custom-element').content
    const toInsert = content.cloneNode(true);
    toInsert.querySelector('#message').innerHTML = data?.content ||
      'No content';
    this.addEventListener('my-change', this.handleMyChange);
    toInsert.querySelector('div').addEventListener('click', this.handleClick);
    this.shadowRoot.appendChild(toInsert);
    this.shadowRoot.addEventListener('my-message', this.handleMyMessage);
  }
  handleMyMessage(e) {
    console.log('my-message');
    console.log(e.detail);
  }
  handleMyChange(e) {
    console.log('my-change fired');
    console.log(e);
    this.shadowRoot.querySelector('#message').innerHTML = e.detail;
  }
  handleClick(e) {
    console.log('click');
    console.log(this.parentNode);
    e.stopPropagation();
    e.preventDefault();
    //console.log(this.parentNode);
    const event = new CustomEvent('my-message', {
      detail: 1,
    });
    this.parentNode.dispatchEvent(event);
  }
}

window.customElements.define('custom-element', CustomElement);

const customElement = document.querySelector('custom-element');
const div = document.createElement('div');
div.setAttribute('slot', 'slot');

let toChange = null
for (let i = 0; i < 5; i++) {
  const c = new CustomElement({
    content: `content ${i}`,
    parent: customElement,
  });
  div.appendChild(c);
  if (i === 1) {
    toChange = c;
  }
}
customElement.appendChild(div);

customElement.addEventListener('click', function() {
  console.log('HERE');
  const e = new CustomEvent('my-change', {
    detail: 'changed',
  });
  toChange.dispatchEvent(e);
});
