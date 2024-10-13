function objectToSearch(query) {
  const seachParams = new URLSearchParams;
  Object.keys(query).forEach(key => seachParams.set(key, query[key]));
  return seachParams;
}

function clearUrl(){
  top.history.pushState({}, "", top.location.origin);
}

export {clearUrl}

class WindowHistory {

  _id;
  _path;
  _query;
  _hash;

  constructor(id, path = '', query = {}, hash = '') {
    this._id = id;
    this._path = path;
    this._query = query;
    this._hash = hash;
    this.pushState()
  }

  /**
   * 
   * @param {Object} query 
   * @param {String} hash 
   */
  pushState(query, hash) {
    const url = new URL(window.location);
    url.pathname = this._path;

    let search;
    if(query) search = objectToSearch(query);
    else search = objectToSearch(this._query);
    search.set("id", this._id);
    url.search = search;
    
    if(hash) url.hash = hash;
    else url.hash = this._hash;

    top.history.pushState({}, "", url);
  }
}

const history = {
  install: (app, options) => {
    app.config.globalProperties.$history = new WindowHistory(app.appId, options.path, options.query, options.hash);
  }
}


export { history }