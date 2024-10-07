/**
 * @param {HTMLElement} home 
 */
function getValues(cbHome) {
  const cb = [...cbHome.querySelectorAll(".cb-window > input[type='checkbox']")];
  for (let i = 0; i < cb.length; i++) {
    if(cb[i].checked) cb[i] = cb[i].value;
    else cb[i] = undefined;
  }
  return cb.filter(v => v);
}

function setPropertyValues(cbHome) {
  try {    
    Object.defineProperty(cbHome, 'cbValues', {
      get: function () {
        return getValues(this);
      }
    })
    const disable = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    Object.defineProperty(cbHome, 'selectionMode', {
      set: function (v) {
        v ? this.addEventListener('dblclick',disable,true) : this.removeEventListener('dblclick',disable,true);
      }
    })
  } catch (e) {
    
  }
}

function setPropertyValue(cbHome){
  const cbWindows = [...cbHome.querySelectorAll(".cb-window")];
  for (let i = 0; i < cbWindows.length; i++) {
    // set property value
    try {      
      Object.defineProperty(cbWindows[i], 'cbValue', {
        get: function(){
          console.log('aaa');
          return this.querySelector("input[type=checkbox]").value; // pointing to ".cb-window > input[type='checkbox']"
        }    
      })
      // set display to none
      cbWindows[i].style.display = 'none';
    } catch (error) {
      
    }
  }
}

/**
 * 
 * @param {HTMLElement} el 
 */
function push(el){
  if(!el.matches("input[type=checkbox]")){
    const cb = el.closest(".cb-room").querySelector("input[type='checkbox']");
    return cb.checked = !cb.checked;  
  } else {
    return !el.checked
  }
}
export {push}

/**
 * di install di cb-room
 * @param {Event} event 
 */
function disablePointerDown(event){
  if(event.which === 1) { // left click
    event.preventDefault();
    push(event.target);
  }
}

/**
 * @param {HTMLElement} cbHome 
 */
function showAll(cbHome){
  const cbWindows = [...cbHome.querySelectorAll(".cb-window")];
  for (let i = 0; i < cbWindows.length; i++) {
    cbWindows[i].style.display = '';
    const cbRoom = cbWindows[i].closest(".cb-room");
    cbRoom.addEventListener('pointerdown', disablePointerDown);
  };
  const cbWindowAll = cbHome.querySelector(".cb-window-all");
  cbWindowAll.style.display = '';
  cbWindowAll.querySelector("input[type=checkbox]").addEventListener('pointerdown', pointerDownCbAll)
  
  cbHome.selectionMode = true;
}
export {showAll};

/**
 * @param {HTMLElement} cbHome 
 */
function hideAll(cbHome, select = false){
  const cbWindows = cbHome.querySelectorAll(".cb-window");
  for (let i = 0; i < cbWindows.length; i++) {
    cbWindows[i].querySelector("input[type=checkbox]").checked = select;
    cbWindows[i].style.display = 'none';
    const cbRoom = cbWindows[i].closest(".cb-room");
    cbRoom.removeEventListener('pointerdown', disablePointerDown);
  }
  const cbWindowAll = cbHome.querySelector(".cb-window-all");
  cbWindowAll.style.display = 'none';
  const cb = cbWindowAll.querySelector("input[type=checkbox]");
  cb.checked = select;
  cb.removeEventListener('pointerdown', pointerDownCbAll);

  cbHome.selectionMode = false;

  cbHome.addEventListener('pointerdown', pointerDetent);
  
}
export {hideAll}

function pointerDownCbAll(event){
  if(event.which === 1){ // left click
    const checked = push(event.target);
    const cbWindows = event.target.closest('.cb-home').querySelectorAll(".cb-window input[type=checkbox]");
    for (let i = 0; i < cbWindows.length; i++) {
      cbWindows[i].checked = checked;
    }
  }
}

function pointerDetent(event){
  if(event.which === 1){ // left click

    const to = setTimeout(()=>{
      push(event.target);
      showAll(event.target.closest(".cb-home"));
      event.target.closest(".cb-home").removeEventListener('pointerdown', pointerDetent);
    },500);

    event.target.addEventListener('pointerup', (e)=>{
      clearTimeout(to);
    },{once:true});
  }
}

function setEventListnener(cbHome){
  if(!cbHome.pointerDetentEventAdded){
    cbHome.addEventListener('pointerdown', pointerDetent);
    cbHome.pointerDetentEventAdded = true;
  }
}

/**
 * HOW TO USE:
 * contoh di Desktop.vue
 * 1. add class ".cb-home, .cb-room, .cb-window, .cb-all?". 
 *    cb-all dan cbRoom berada di posisi yang sama, eg.: di <tr>. 
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

  // define property values on cbHome
  setPropertyValues(cbHome);
  
  // define property value on cb-window
  // set display cb-window to none
  setPropertyValue(cbHome);  

  // set event listener on cb-room
  setEventListnener(cbHome); 

  const cbAll = cbHome.querySelector(".cb-window-all");
  cbAll.style.display = 'none';
}

export {installCheckbox};

