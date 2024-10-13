// function objectToSearch(query) {
//   const seachParams = new URLSearchParams;
//   Object.keys(query).forEach(key => seachParams.set(key, query[key]));
//   return seachParams;
// }

function clearUrl(){
  top.history.pushState({}, "", top.location.origin);
}

export {clearUrl}

/**
 * ini akan di tempel di setiap window app
 */
class WindowHistory {

  constructor(id) {
    this.pushState({id: id});
  }

  /**
   * 
   * @param {Object} query key is any object that enable toString() 
   * @param {String} hash 
   */
  pushState(query, hash) {
    const url = new URL(window.location);
    if(query) Object.keys(query).forEach(key => url.searchParams.set(key, query[key].toString()));    
    if(hash) url.hash = hash;
    top.history.pushState({}, "", url);
  }

  /**
   * @param {String} key 
   * @returns {Array}
   */
  getQuery(key){
    return (new URL(window.location)).searchParams.get(key).split(",");
  }

  /**
   * @returns {String}
   */
  getHash(){
   return (new URL(window.location)).hash;
  }
}

const history = {
  install: (app) => {
    app.config.globalProperties.$history = new WindowHistory(app.appId);
    // app.config.globalProperties.$history = new WindowHistory(app.appId, options.path, options.query, options.hash);
  }
}


export { history }