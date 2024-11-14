/**
 * HOW TO USE
 * 
 * 1. Construct >> const fm = new FloatMenu();
 * 2. set id as per 'menuId' to the element
 * 3. >> fm.register(menuId, [triggerId:number, on:string], level:number)
 * 
 * kekurangan: tidak sepert class ContextMenu yang pernah saya bikin, tidak bisa taruh form input di menu, supaya proses lebih cepat
 */
export default class FloatMenu {

  active = []; // contain menu id. index element refers to menu level
  menus = new WeakMap();

  event; // Event pertama kali harusnya nanti anchor tidak diperlukan lagi
  set event(v){
    this.event = new WeakRef(v);
  }
  get event(){
    return this.event.deref();
  }

  /**
   * @deprecated
   */
  anchor; // HTMLElement
  set anchor(v){
    this.anchor = new WeakRef(v);
  }
  get anchor(){
    return this.anchor.deref();
  }

  constructor() {
    // BB, AA, bb, aa, cc
    // document.addEventListener('mouseup', ()=> console.log('aa'))
    // document.addEventListener('mousedown', ()=> console.log('AA'))
    // document.addEventListener('pointerup', ()=> console.log('bb'))
    // document.addEventListener('pointerdown', ()=> console.log('BB'))
    // document.addEventListener('click', ()=> console.log('cc'))
    
    document.addEventListener('click', ()=> this.off())
    // document.addEventListener('click', ()=> this.off(), true);
    // document.addEventListener('pointerup', ()=> this.off())
    // document.addEventListener('contextmenu', ()=>this.off(),true); // kalau capture artinya akan di listen oleh top to bottom element
    // document.addEventListener('contextmenu', ()=>this.off()); // kalau capture artinya akan di listen oleh top to bottom element
    document.addEventListener('contextmenu', ()=>this.off(), true); // kalau capture artinya akan di listen oleh top to bottom element
  }

  /**
   * 
   * @param {string} menuId 
   * @param {number} level 
   * @param {array} config berisi object dengan triggerId:number, on:string
   */
  register(menuId, config = [], level = 0) {
    const menu = document.getElementById(menuId);
    menu.level = level;
    menu.style.display = 'none';
    menu.style.position = 'fixed';
    menu.style.zIndex = '300';
    if (config.length) {
      for (let i = 0; i < config.length; i++) {
        const triggerElement = document.getElementById(config[i].triggerId);
        triggerElement.menu = {} 
        triggerElement.menu[config[i].on]  = menuId;
        this.setListener(triggerElement, config[i].on, level);
      }
    } else {
      this.setListener(menu.parentElement, 'contextmenu',0);
    }
  }

  /**
   * untuk setiap trigger element dipasang listener
   * @param {HTMLElement} element 
   * @param {string} eventName 
   */
  setListener(triggerElement, eventName, level) {
    triggerElement.addEventListener(eventName, (e) => {
      e.stopPropagation();
      e.preventDefault();
      // this.anchor = e.target;
      this.event = e;

      const previousId = this.active[level];
      let currentMenu = document.getElementById(triggerElement.menu[eventName]);
      let previousMenu = document.getElementById(previousId);

      if(!level && previousMenu && previousMenu.style.display !== 'none') {
        previousMenu.style.display = 'none';
        return;
      }

      if(eventName === 'mouseover' || eventName === 'pointerover'){
        if(!currentMenu.onmouseleave) {
          currentMenu.onmouseleave = function(event){
            this.style.display = 'none';
          }
        }
      }

      // turn off previous
      if(previousMenu) {
        previousMenu.style.display = 'none'
        previousMenu.copiable = false;
      };
      // turn on current
      this.active[level] = currentMenu.id;
      currentMenu.style.display = '';
      const coordinate = this.#getPosition(currentMenu, level, e);
      this.setPosition(currentMenu, coordinate.x, coordinate.y);
      if(window.getSelection().type === 'Range') currentMenu.copiable = true;
    });
  }

  setPosition(menu, clickCoordsX, clickCoordsY) {
    const menuWidth = menu.offsetWidth + 4;
    const menuHeight = menu.offsetHeight + 4;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if ((windowWidth - clickCoordsX) < menuWidth) {
      menu.style.left = windowWidth - menuWidth + "px";
    } else {
      menu.style.left = (clickCoordsX - 10) + "px";
    }

    if ((windowHeight - clickCoordsY) < menuHeight) {
      menu.style.top = windowHeight - menuHeight + "px";
    } else {
      menu.style.top = (clickCoordsY - 10) + "px";
    }
  }

  // get the position of the right-click in window and returns the x and y coordinates
  /**
   * 
   * @param {HTMLElement} menu 
   * @param {Number} level minimum 0, maximum ~
   * @param {Event} e 
   * @returns {Object}
   */
  #getPosition(menu, level, e) {
    const rect = menu.getBoundingClientRect();
    let posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    let posY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;

    if((posX + (rect.width * (level + 1))) > window.innerWidth){
      posX = window.innerWidth - (rect.width * (level + 1));
    }
    if((posY + rect.height) > window.innerHeight){
      posY = window.innerHeight - rect.height;
    }

    return {
      x: posX,
      y: posY,
    };
  }

  off(menuId) {
    if (menuId) {
      const menu = document.getElementById(menuId);
      if(menu) {
        menu.style.display = 'none';
        this.active[menu.level] = undefined;
        menu.copiable = false;
      }
    } else {
      for (let i = 0; i < this.active.length; i++) {
        const menu = document.getElementById(this.active[i]);
        menu.style.display = 'none';
        menu.copiable = false;
      }
      this.active = [];
    }

    this.isCopiable = false;
  }

  on(menuId) {
    const menu = document.getElementById(menuId);
    menu.style.display = '';
    this.active[menu.level] = undefined;
    if(window.getSelection().type === 'Range'){
      menu.copiable = true;
    }
  }


}