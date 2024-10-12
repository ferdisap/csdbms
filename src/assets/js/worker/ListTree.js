function ListTree() {
  return {
    data: {},
    request: async function (data) {
      let response;
      let route = data.route;
      if (route.method === 'GET') {
        response = await fetch(route.url, {
          headers: route.headers
        });
      }
      return new Promise(async (resolve, reject) => {
        if (response.ok) {
          let json = await response.json();
          // resolve(setListTreeData(json.csdbs)); // jika ingin pakai modul
          // resolve(this.setListTreeData(json.csdbs));
          resolve(this.setListTreeData(json.csdbs));
        } else {
          reject([]);
        }
      })
    },
    /**
     * @return {Array}
     * @param {Object} response from axios Response 
     */
    setListTreeData: function (responseData) {
      // sortir berdasarkan path
      responseData = responseData.sort((a, b) => {
        return a.path > b.path ? 1 : (a.path < b.path ? -1 : 0);
      });
      // sortir object dan level path nya eg: "/csdb/n219/amm" berarti level 3
      let obj = {};
      let levels = {};
      for (const v of responseData) {
        let path = v.path
        let split = path.split("/");
        let l = split.length;

        let p = [];
        for (let i = 1; i <= l; i++) {
          p.push(split[i - 1]);
          levels[i] = levels[i] ?? [];
          levels[i].push(p.join("/"));
        }
        levels[l].indexOf(path) < 0 ? levels[l].push(path) : '';

        obj[path] = obj[path] || [];
        obj[path].push(v);

      }
      return [obj, levels];
    },

    createHTMLString: function () {
      const gen_objlist = function (models, style = '') {
        style ? (style = `style="${style}"`) : '';
        let listobj = '';
        if (models) { // ada kemungkinan models undefined karena path "csdb/n219/amm", csdb/n219 nya tidak ada csdbobject nya
          for (const model of models) {
            const isICN = model.filename.substr(0, 3) === 'ICN';
            const logo = isICN ? `<span class="material-symbols-outlined item">mms</span>&#160;` : `<span class="material-symbols-outlined item">description</span>&#160;`;
            let href = isICN ? this.hrefForOther : this.hrefForPdf;
            const cb = `<span class="cb-window"><input type="checkbox" value="${model.filename}"/></span>`;
            href = href.replace(':filename', model.filename);
            const viewType = isICN ? 'other' : 'pdf';
            listobj = listobj + `
                 <div class="cb-room" ${style}>
                   ${cb}${logo}<a href="${href}" @click.prevent="$parent.clickFilename({path:'${model.path}',filename: '${model.filename}', viewType:'${viewType}'})">${model.filename}</a>
                 </div>`
          }
        }
        return listobj
      };
      const path_yang_sudah = [];
      const fn = (start_l = 1, leveldata = {}, dataobj = {}, callback, parentPath = '') => {
        let details = '';
        let defaultMarginLeft = 5;
        if (leveldata[start_l]) {

          for (const path of leveldata[start_l]) { // untuk setiap path 'csdb' dan 'xxx'

            let pathSplit = path.split("/");
            let currFolder = pathSplit[start_l - 1];
            pathSplit.splice(pathSplit.indexOf(currFolder), 1);
            let parentP = pathSplit.join("/");

            if (path_yang_sudah.indexOf(path) >= 0
              || path_yang_sudah.indexOf(parentP) >= 0
              || parentP !== parentPath // expresi ini membuat path tidak di render
            ) {
              continue;
            }
            let isOpen = this.open ? this.open[path] : false;
            isOpen = isOpen ? 'open' : '';
            const cbAll = `<span class="cb-window-all"><input type="checkbox" value=""/></span>`;

            // CSS
            // details = "ml-3"
            // .chevron = "cursor-pointer text-sm content-center"
            // .item = "text-xs"
            // .cb-window, .cb-window-all = mr-1

            // generating folder list
            // <details ${isOpen} style="margin-left:${start_l * 3 + defaultMarginLeft}px;" path="${path}" @click="clickDetails($el)">
            // <details ${isOpen} class="cb-room" style="margin-left:${start_l * 3 + defaultMarginLeft}px;" path="${path}">
            // margin diganti dengan css tailwind ml-3
            details = details + `
            <details ${isOpen} class="cb-room" path="${path}">
              <summary class="list-none flex">
              <span @click.prevent="expandCollapse('${path}')" class="material-symbols-outlined chevron">chevron_right</span> 
               ${cbAll}
               <a href="#" @click.prevent="$parent.clickFolder({path: '${path}'})">${currFolder}</a>
             </summary>`;

            if (leveldata[start_l + 1]) {
              details = details + (callback.bind(this, start_l + 1, leveldata, dataobj, callback, path))();
            }

            // generating obj list
            // details = details + (gen_objlist.bind(this, dataobj[path], `margin-left:${start_l * 3 + defaultMarginLeft + 2}px;`))();
            details = details + (gen_objlist.bind(this, dataobj[path]))();

            details = details + "</details>"

            path_yang_sudah.push(path);
          }
        }
        return details.replace(/\s+/g, ' ');
      };

      return fn(this.start_l, this.list_level, this.list, fn);
    }
  }
}

onmessage = async function (e) {
  let ret;
  switch (e.data.mode) {
    case 'fetchData':
      ret = new ListTree();
      const data = await ret.request(e.data.data);
      this.postMessage(data);
      break;
    case 'createHTMLString':
      ret = new ListTree();
      ret.open = e.data.data.open;
      ret.start_l = e.data.data.start_l;
      ret.list = e.data.data.list;
      ret.list_level = e.data.data.list_level;
      ret.hrefForPdf = e.data.data.hrefForPdf;
      ret.hrefForHtml = e.data.data.hrefForHtml;
      ret.hrefForOther = e.data.data.hrefForOther;
      const htmlstr = ret.createHTMLString();
      postMessage(htmlstr);
      break;
    default:
      break;
  }
}