import { addGetLogic, addSetLogic } from "../util/ObjectProperty";

// /**
//  * @param {HTMLElement} home 
//  */
// function getValues(cbHome) {
//   const cb = [...cbHome.querySelectorAll(".cb-window > input[type='checkbox']:checked")];
//   for (let i = 0; i < cb.length; i++) {
//     if (cb[i].checked) cb[i] = cb[i].value;
//     else cb[i] = undefined;
//   }
//   return cb.filter(v => v);
// }

// function getCbChecked(cbHome) {
//   return [...cbHome.querySelectorAll(".cb-window > input[type='checkbox']")];
// }
// export {getCbChecked}

const disable = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

function setPropertyValues(cbHome) {
  try {
    Object.defineProperty(cbHome, 'cbValues', {
      get: () => [...cbHome.querySelectorAll(".cb-window > input[type='checkbox']:checked")].map(cb => cb.value),
    })
    Object.defineProperty(cbHome, 'cb', {
      get: () => [...cbHome.querySelectorAll(".cb-window > input[type='checkbox']:checked")],
    })
    Object.defineProperty(cbHome, 'selectionMode', {
      set: function (v) {
        if (v) {
          this.addEventListener('mousedown', disable, true);
          // this.addEventListener('pointerup', disable, true);
          this.addEventListener('mouseup', disable, true);
          this.addEventListener('click', disable, true);
          this.addEventListener('dblclick', disable, true);
        } else {
          this.removeEventListener('mousedown', disable, true);
          // this.removeEventListener('pointerup', disable, true);
          this.removeEventListener('mouseup', disable, true);
          this.removeEventListener('click', disable, true);
          this.removeEventListener('dblclick', disable, true)
        }
        this.sm = v;
      },
      // get: function () {
      //   return this.sm;
      // }
    })
  } catch (e) {

  }
}

function setPropertyValue(cbHome) {
  const cbRooms = cbHome.querySelectorAll('.cb-room');
  for (let i = 0; i < cbRooms.length; i++) {
    const cbWindow = cbRooms[i].querySelector(".cb-window");
    if (cbWindow) {
      try {
        Object.defineProperty(cbWindow, 'cbValue', {
          get: function () {
            return this.querySelector("input[type=checkbox]").value; // pointing to ".cb-window > input[type='checkbox']"
          }
        })
      } catch (error) { }
      if (!cbRooms[i].cbWindow) {
        cbRooms[i].cbWindow = new WeakRef(cbWindow);
        addGetLogic(cbRooms[i], 'cbWindow', (ctx, value) => value.deref());
      }

      // set display to none
      cbWindow.style.display = 'none';
    }
  }
}

/**
 * 
 * @param {HTMLElement} el 
 */
function push(el) {
  if (!el.matches("input[type=checkbox]")) {
    const cbRoom = el.closest(".cb-room");
    const cb = cbRoom.querySelector("input[type='checkbox']");
    // cbRoom.closest(".cb-home").cbRoom = new WeakRef(cbRoom);
    return cb.checked = !cb.checked;
  } else {
    // el.closest(".cb-home").cbRoom = new WeakRef(el.closest(".cb-room"))
    return el.checked = !el.checked
  }
}
export { push }

/**
 * di install di cb-room
 * @param {Event} event 
 */
function onPointerUp(event) {
  event.stopPropagation(); // kalau ga di stop, maka kalau cbroom nya di ada event click maka akan berjalan juga eventnya
  if (event.which === 1) { // left click
    event.preventDefault();
    push(event.target);
  }
}

function onPointerUpCbAll(event) {
  event.stopPropagation();
  if (event.which === 1) { // left click
    event.preventDefault();
    const checked = push(event.target);
    // jika ingin otomatis checking all other cb, pakai fungsi addSetLogic di ObjectProperty.js
    const cbWindows = event.target.closest('.cb-home').querySelectorAll(".cb-window input[type=checkbox]");
    for (let i = 0; i < cbWindows.length; i++) {
      cbWindows[i].checked = checked;
    }
  }
}

/**
 * @param {HTMLElement} cbHome 
 */
function showAll(cbHome) {
  const cbWindows = [...cbHome.querySelectorAll(".cb-window")];
  for (let i = 0; i < cbWindows.length; i++) {
    cbWindows[i].style.display = '';
    const cbRoom = cbWindows[i].closest(".cb-room");
    cbRoom.addEventListener('pointerup', onPointerUp);
  };
  const cbWindowAll = cbHome.querySelector(".cb-window-all");
  if (cbWindowAll) {
    cbWindowAll.style.display = '';
    const cbRoom = cbWindowAll.closest(".cb-room");
    cbRoom.addEventListener('pointerup', onPointerUpCbAll);
  }
  cbHome.selectionMode = true;
}
export { showAll };

/**
 * @param {HTMLElement} cbHome 
 */
function hideAll(cbHome, select = false) {
  const cbWindows = cbHome.querySelectorAll(".cb-window");
  for (let i = 0; i < cbWindows.length; i++) {
    cbWindows[i].querySelector("input[type=checkbox]").checked = select;
    cbWindows[i].style.display = 'none';
    const cbRoom = cbWindows[i].closest(".cb-room");
    cbRoom.removeEventListener('pointerup', onPointerUp);
  }
  const cbWindowAll = cbHome.querySelector(".cb-window-all");
  if (cbWindowAll) {
    cbWindowAll.style.display = 'none';
    const cb = cbWindowAll.querySelector("input[type=checkbox]");
    cb.checked = select;
    const cbRoom = cbWindowAll.closest(".cb-room");
    cbRoom.removeEventListener('pointerup', onPointerUpCbAll);
  }
  cbHome.selectionMode = false;
  cbHome.addEventListener('pointerdown', pointerDetent);

}
export { hideAll }


function pointerDetent(event) {
  if (event.which === 1) { // left click

    const to = setTimeout(() => {
      showAll(event.target.closest(".cb-home"));
      event.target.closest(".cb-home").removeEventListener('pointerdown', pointerDetent);
    }, 500);

    event.target.addEventListener('pointerup', (e) => {
      clearTimeout(to);
    }, { once: true });

    event.target.addEventListener('pointermove', (e) => {
      clearTimeout(to);
    }, { once: true });
  }
}

function setEventListnener(cbHome) {
  if (!cbHome.pointerDetentEventAdded) {
    cbHome.addEventListener('pointerdown', pointerDetent);
    cbHome.pointerDetentEventAdded = true;
  }
}

/**
 * HOW TO USE:
 * contoh di Desktop.vue
 * 1. add class ".cb-home, .cb-room, .cb-window, .cb-window-all?". 
 *    Di rekomendasikan agar instal input[type=checkbox] sebagai firstElementChild .cb-window
 * 2. use installCheckbox(cbHomeTarget)
 * 3. use hideAll(), showALl(), push() to manipulating display
 * 
 * cb-window attribute must be a parent of a checkbox;
 * @param {HTMLElement} cbHome 
 */
function installCheckbox(cbHome) {
  // set attribute
  cbHome.classList.add("cb-home")

  // add current cbRoom select by pointer
  if (!cbHome.current) {
    cbHome.current = new WeakRef(cbHome.querySelector(".cb-room"));
    addSetLogic(cbHome, "current", (ctx, value) => new WeakRef(value));
    addGetLogic(cbHome, "current", (ctx, value) => value.deref());
  }

  // define property values on cbHome
  setPropertyValues(cbHome);

  // define property value on cb-window
  // set display cb-window to none
  setPropertyValue(cbHome);

  // set event listener on cb-room
  setEventListnener(cbHome);

  const cbWindowsAll = cbHome.querySelectorAll(".cb-window-all");
  for (let i = 0; i < cbWindowsAll.length; i++) {
    cbWindowsAll[i].style.display = 'none';
  }

  // add mark border on cbRoom, saat di coba, event terdispatch 2x padahal script ini dijalankan sekali hanya untuk listtree
  const cbRooms = cbHome.querySelectorAll(".cb-room");
  for (let i = 0; i < cbRooms.length; i++) {
    if (!cbRooms[i].addedListenerForMark) {
      cbRooms[i].addEventListener('pointerup', mark.bind(cbRooms[i]))
      cbRooms[i].addedListenerForMark = true;
    }
  }
}

export { installCheckbox };

// ##### dibawah ini fungsi fungsi untuk mempermudah vue component yang biasa dipaka

function cancel() {
  const cbHome = top.FloatMenu.anchor.closest(".cb-home");
  if (cbHome) hideAll(cbHome);
}
function select() {
  const cbHome = top.FloatMenu.anchor.closest(".cb-home");
  if (cbHome) {
    const checked = push(top.FloatMenu.anchor);
    showAll(cbHome);

    if (top.FloatMenu.anchor.closest(".cb-room").querySelector('.cb-window-all')) {
      const cbWindows = top.FloatMenu.anchor.closest('.cb-home').querySelectorAll(".cb-window input[type=checkbox]");
      for (let i = 0; i < cbWindows.length; i++) {
        cbWindows[i].checked = checked;
      }
    }
  };
}
function mark(event) {
  event.stopPropagation();
  const cbHome = this.closest(".cb-home");
  const currentTagName = this.nodeName;
  const ptarget = cbHome.current;
  const previousTagName = ptarget.tagName;

  switch (previousTagName) {
    case 'DETAILS': ptarget.firstElementChild.style.backgroundColor = ""; break;
    default: ptarget.style.backgroundColor = ""; break;
  }

  switch (currentTagName) {
    case 'DETAILS': this.firstElementChild.style.backgroundColor = "rgb(188 220 241)"; break;
    default: this.style.backgroundColor = "rgb(188 220 241)"; break;
  }

  cbHome.current = this;
}
export { cancel, select }