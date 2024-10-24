import Randomstring from "randomstring";
import {
  isObject, isString, isNumber, findText, getObjectValueFromString, indexFromParent, isLeftClick, isCharacterKeyPress
} from "../util/helper"
import axios from 'axios';
import routes from '../../routes.json';

/**
 * HOW TO USE
 * 1. Add attribute 'dd-input="$key"' dimana $key adalah data yang akan didapan dari server, bisa multiple pakai separator ",". Key pertama adalah value yang nanti ditulis di input dan yang menjadi acuan query ke server. Misal '/?sc=filename::DMC' artinya key pertama harus filename
 * 2. Add attribute 'dd-target="$inputId"' dimana $inputId adalah target input saat result selected. Bisa multiple pakai comma, dimana urutannya sesuai dengan attribute dd-input. Kalau ''||'self' berarti targetnya self
 * 3. Add attribute 'dd-route="routeName"';
 * 4. Add attribute 'dd-type="csdbs"' atau 'dd-type="users"' dimana key dari sebuah data/result dari server. defaultnya 'result' atau 'results'
 * 5. run installDropdown with HTMLElement as param
 */

function installDropdown(ddInput) {
  if (!ddInput.id) ddInput.id = Randomstring.generate({ charset: 'alphabetic' });
  ddInput.addEventListener('focusin', onFocusIn.bind(ddInput));
  ddInput.addEventListener('keydown', onKeyPress.bind(ddInput));
  ddInput.addEventListener('focusout', function (e) {
    e.target.to_focusout = setTimeout(function () {
      const container = this.parentElement.querySelector("#" + this.listContainerId);
      if (container) container.style.display = 'none'
    }.bind(this), 100);
  }.bind(ddInput));
  ddInput.listContainerId = Randomstring.generate({ charset: 'alphabetic' });
  ddInput.dd = {
    keys: ddInput.getAttribute('dd-input').split(","),
    targets: ddInput.getAttribute('dd-target').split(","),
    results: [],
    route: ddInput.getAttribute('dd-route'), // route name
    type: ddInput.getAttribute('dd-type'),
  }
}

export { installDropdown }

function onFocusIn() {
  const container = this.parentElement.querySelector("#" + this.listContainerId);
  if (container) container.style.display = '';
}

function onKeyPress(event) {
  this.focus();
  setTimeout(() => clearTimeout(this.to_focusout), 0);
  let isSearch;

  switch (event.keyCode) {
    case 40:
      event.preventDefault();
      return move.call(this, event.target, true); // move down
    case 38:
      event.preventDefault();
      return move.call(this, event.target, false); // move up
    case 13:
      event.preventDefault();
      return select.call(this, event.target);
    case 27: return cancel.call(this, event.target); // escape key
    case 8: isSearch = true; break; // backspace
    case 46: isSearch = true; break; // delete
  }
  if (isCharacterKeyPress(event)) isSearch = true;
  if (isSearch) {
    clearTimeout(this.to_search);
    this.to_search = setTimeout(searching.bind(this, event.target), 300)
  }
}

function onClick(event) {
  event.preventDefault();
  event.stopPropagation();
  // this.focus();
  // setTimeout(() => clearTimeout(this.to_focusout),0);
  if (isLeftClick(event)) select.call(this, event.target);
}

function move(el, down = true) {
  // this adalah input element
  if (el === this) {
    el = down ? document.getElementById(el.listContainerId).firstElementChild : document.getElementById(el.listContainerId).lastElementChild; // list item pertama
  } else {
    el = (down ? el.nextElementSibling : el.previousElementSibling)
    if (!el) el = this;
  }
  // focusing list
  el.tabIndex = 0;
  el.focus();
}


function select(evtTarget) {
  if (evtTarget === this) return searching.call(this, evtTarget);
  // evtTarget = evtTarget.closest("div");
  const indexInResults = indexFromParent(evtTarget.closest("div")); // number
  // untuk setiap target, akan di render value of keys nya

  const event = new Event("dd-selected");
  for (let i = 0; i < this.dd.targets.length; i++) {
    let el, append;
    if (this.dd.targets[i].includes('-append')) append = true;

    if (this.dd.targets[i] === '' || !this.dd.targets[i] || this.dd.targets[i].substr(0, 4) === 'self') {
      el = this;
    } else {
      el = (append ?
        document.getElementById(this.dd.targets[i].replace('-append', '')) :
        document.getElementById(this.dd.targets[i]));
    }

    if (append) {
      el.value = el.value.replace(/(.+,).+/gm, (m, p1) => p1); // akan menghilangkan value terakhir. Eg: 'DMC-saaksmas.xml, DMC-x, DMC-y' akan menghilangkan ' DMC-y'.
      el.value += ' ' + getObjectValueFromString(this.dd.results[indexInResults], this.dd.keys[i]);
    } else {
      el.value = getObjectValueFromString(this.dd.results[indexInResults], this.dd.keys[i]);
    }
    
    el.dispatchEvent(event);    
  }

  // close/unshowed container here
  // findAncestor(event.target, "*[dd-container-result]").style.display = 'none';
  evtTarget.closest("#" + this.listContainerId).style.display = 'none';
}

function cancel(evtTarget) {
  evtTarget.tabIndex = -1;
  if (evtTarget === this) {
    while (evtTarget.nextElementSibling && evtTarget.nextElementSibling.id === this.listContainerId) {
      evtTarget.nextElementSibling.style.display = 'none';
      break;
    }
  } else {
    evtTarget.closest("#" + this.listContainerId).style.display = 'none';
  }
}

function searching(evtTarget) {
  if (!evtTarget.value) return;
  const searchValue = evtTarget.value.replace(/.+,/gm, '').trim();
  const params = { sc: '' };
  for (let i = 0; i < this.dd.keys.length; i++) {
    params.sc += this.dd.keys[0] + '::' + searchValue + ","
  }
  params.sc = params.sc.substring(0,params.sc.length-1);
  params.limit = 5;
  axios({
    url: routes[this.dd.route]['path'],
    method: routes[this.dd.route]['methods'][0],
    params: params
  })
    .then(response => {
      this.dd.results = setResults(this.dd.type, response.data);
      render.call(this);
    })
}

function setResults(type, data) {
  if(type === 'csdbs'){
    data.csdbs.forEach((csdb,i) => {
        data.csdbs[i] = {
        storage: csdb[0],
        path: csdb[1],
        filename: csdb[2],
      }
    })
  }
  return type ? (
    data[type] ? data[type] : (
      data.results ? data.results : (
        data.result ? data.result : []
      )
    )
  ) : (
    data.results ? data.results : (
      data.result ? data.result : []
    )
  )
}

function render() {
  let container = document.getElementById(this.listContainerId);
  if (container) container.remove();

  // create new container
  container = fromHTML.call(this, template.call(this));

  this.parentElement.style.position = 'relative';
  this.parentElement.append(container);
}

function fromHTML(html, trim = true) {
  // Process the HTML string.
  html = trim ? html.trim() : html;
  if (!html) return null;

  // Then set up a new template element.
  const template = document.createElement('template');
  template.innerHTML = html;
  const result = template.content.children;

  [...result].forEach(r => {
    r.addEventListener('click', onClick.bind(this));
    r.addEventListener('keydown', onKeyPress.bind(this));
  })

  // Then return either an HTMLElement or HTMLCollection,
  // based on whether the input HTML had one or more roots.
  if (result.length === 1) return result[0];
  return result;
}

// contoh jika pakai innerHTML yang collection[id].keys nya punya lebih dari 1, misal keysnya adalah @dd-input="filename,path"
// const template = getContainerResultTemplate(
//   this.collection[id].results,
//   [
//     {
//       __element: 'span',
//       __class: 'text-sm',
//       __innerHTML: [ ":"+this.collection[id].keys[0], " " ,{ // modif di '0' of (keys[0]) nya sesuai keinginan
//         __element: 'span',
//         __class: 'text-sm italic',
//         __innerHTML: [":"+this.collection[id].keys[1]],
//       }],
//     }
//   ],
//   id,
//   this.collection[id].targets.join(","),
// );
function template() {
  let config;
  switch (this.dd.type) {
    case 'csdbs':
      config = [
        {
          __element: 'span',
          __class: 'text-sm',
          __innerHTML: [":" + this.dd.keys[0], " ", { // modif di '0' of (keys[0]) nya sesuai keinginan
            __element: 'span',
            __class: 'text-sm italic text-pink-300',
            __innerHTML: [":path"],
          }],
        }
      ]
      break;
    case 'users':
      config = [
        {
          __element: 'span',
          __class: 'text-sm',
          // __innerHTML: [":first_name :middle_name :last_name" + (this.dd.keys[0] ? ':'+this.dd.keys[0] : ''), " ", { // modif di '0' of (keys[0]) nya sesuai keinginan
          __innerHTML: [":first_name :middle_name :last_name", " ", { // modif di '0' of (keys[0]) nya sesuai keinginan
            __element: 'span',
            __class: 'text-sm italic text-pink-300',
            __innerHTML: [":email"],
          }],
        }
      ]
      break;
    default:
      config = [
        {
          __element: 'span',
          __class: 'text-sm',
          __innerHTML: [this.dd.keys.map(v => (v = ':' + v)).join(" ")],
        }
      ];
      break;
  }

  return getContainerResultTemplate.call(this, config);
}
// this.dd.results,
// config,
// this.id,
// this.dd.targets.join(","),

// data = [d,...d]. d adalah {}, keysnya adalah 'keys[string...]','targets[string...]','result[object...]'.
// dataResults = [o,...o]. o adalah {}, keysnya sesuai dengan hasil fetch backedn
// config = [c,...c]. c adalah {}, keysnya adalah '__element','__class','__style', '__innerHTML[configsOrKey,...configsOrKey]',
function getContainerResultTemplate(configs = [{ __element: '', __class: '', __style: '', __innerHTML: [] }]) {
  const dataResults = this.dd.results;
  let html = '<div ' + 'id=' + this.listContainerId + ' class="w-full absolute z-50 bg-gray-50 shadow-md rounded-md">';
  for (let o = 0; o < dataResults.length; o++) {
    html += `<div class="text-sm border-b p-2 cursor-pointer hover:bg-blue-300 text-left">`;
    for (let c = 0; c < configs.length; c++) {
      let inner = makeInner(configs[c]);
      let match = findText(/:[\w\.]+/g, inner);
      for (let m = 0; m < match.length; m++) {
        const key = match[m][0].replace(":", '');
        const value = getObjectValueFromString(dataResults[o], key);
        inner = inner.replace(match[m][0], value);
      }
      html += inner;
    }
    html += `</div>`;
  }
  html += `</div>`;
  return html;
};

function makeInner(config = { __element: '', __class: '', __style: '', __innerHTML: [] }) {
  let html = `<${config.__element}` + (config.__class ? ` class="${config.__class}"` : '') + (config.__style ? ` style="${config.__style}"` : '') + `>`;
  for (let i = 0; i < config.__innerHTML.length; i++) {
    let str;
    if (isObject(config.__innerHTML[i])) str = makeInner(config.__innerHTML[i]);
    else if (isString(config.__innerHTML[i]) || isNumber(config.__innerHTML[i])) str = config.__innerHTML[i];
    html += str;
  }
  html += `</${config.__element}>`;
  return html;
}







