function getAccessorDescriptor(obj, prop) {
  if (obj === null) { // only necessary if you may overwrite missing properties
    return {
      get(){},
      set(){},
      enumerable: false,
      configurable: true
    };
  }
  const desc = Object.getOwnPropertyDescriptor(obj, prop);
  if (!desc) {
    return getAccessorDescriptor(Object.getPrototypeOf(obj), prop);
  }
  if ("writable" in desc) { // only necessary if you might overwrite data properties
    return {
      get() { return desc.value; },
      set(v) { if (desc.writable) desc.value = v; else throw new TypeError() },
      enumerable: desc.enumerable,
      configurable: true,
    }
  }
  return desc;
}

/**
 * harus ditulis sebelum addGetLogic
 * logic harus mereturn sebuah value yang akan di set;
 * @param {*} obj 
 * @param {*} prop 
 * @param {*} logic akan menghasilkan parameter ctx,value
 */
function addSetLogic(obj, prop, logic) {
  const oldDescriptor = getAccessorDescriptor(obj, prop);
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  Object.defineProperty(obj, prop, {
    ...oldDescriptor,
    set(newValue) {
      oldDescriptor.set.call(this, logic(this, newValue));
    }
  });
}
export {addSetLogic}

function addSetLogic2(obj, prop, logic) {
  const oldDescriptor = getAccessorDescriptor(obj, prop);
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  Object.defineProperty(obj, prop, {
    ...oldDescriptor,
    set(newValue) {
      oldDescriptor.set.call(this, newValue);
      logic(this, newValue);
    }
  });
}
export {addSetLogic2}

/**
 * 
 * @param {*} obj 
 * @param {*} prop 
 * @param {*} logic akan menghasilkan parameter ctx,value
 */
function addGetLogic(obj, prop, logic) {
  const oldDescriptor = getAccessorDescriptor(obj, prop);
  Object.defineProperty(obj, prop, {
    get() {
      return logic(this, oldDescriptor.get.call(this));
    }
  });
}

export {addGetLogic}


// src: https://stackoverflow.com/questions/74720929/wanting-to-change-a-setter-of-a-single-input-field-how-to-advance-to-check-if-t
// EXAMPLE
// div = document.createElement('div');
// div.innerHTML = `<input type="checkbox"/>`;
// document.body.appendChild(div);
// input = div.firstElementChild;
// addLogic(input, 'checked', (ctx, value)=>{
//     console.log(ctx, value)
// })
// addLogic(input, 'xxchecked', (ctx, value)=>{
//     console.log(ctx, value)
// })
// input.checked = true;
// output: setting input.checked to true and do console.log(ctx, value)


// EXAMPLE 2
// const setAll = (input,value) => {
//   console.log(value, input);
//   const cbHome = input.closest(".cb-home");
//   const cbAll = cbHome.querySelectorAll(".cb-window input[type=checkbox]");
//   for (let i = 0; i < cbAll.length; i++) {
//     cbAll[i].checked = value;
//   }
// }
// const cbWindowAll = cbHome.querySelector(".cb-window-all");
// if (cbWindowAll) {
//   const cbAll = cbWindowAll.querySelector("input[type=checkbox]");
//   addSetLogic(cbAll, 'checked', (ctx, value) => setAll(ctx,value));
// }