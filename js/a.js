const wavesEl = document.querySelector('.waves');

function onChange(cb, el) {
  el.addEventListener('change', cb);
}

function setShape(ev) {
  wavesEl.classList.remove('round', 'other');
  const newShape = ev.target.value;
  if (newShape) wavesEl.classList.add(newShape);
}

function setAnimation(ev) {
  const animation = ev.target.value;
  const value = ev.target.checked;
  wavesEl.classList.toggle(animation, value);
}

document
  .querySelectorAll('[name="shape"]')
  .forEach(onChange.bind(this, setShape));

document
  .querySelectorAll('[name="animation"]')
  .forEach(onChange.bind(this, setAnimation));
