const array_unique = (arr) => arr.filter((value, index, a) => a.indexOf(value) === index);

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
          resolve(this.setListTreeData(json.csdbs)); //[storage,path,filename]
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
        return a[1] > b[1] ? 1 : (a[1] < b[1] ? -1 : 0); // 1 adalah path
      });
      // sortir object dan level path nya eg: "/csdb/n219/amm" berarti level 3
      let obj = {};
      let levels = {};
      for (const v of responseData) {
        let path = v[1]
        let split = path.split("/");
        let l = split.length;

        let p = [];
        for (let i = 1; i <= l; i++) {
          p.push(split[i - 1]);
          levels[i] = levels[i] ?? [];
          levels[i].push(p.join("/"));
        }
        levels[l].indexOf(path) < 0 ? levels[l].push(path) : '';
        // levels[l].push(path)

        obj[path] = obj[path] || [];
        obj[path].push({
          filename: v[2],
          // path: v[1],
          storage: v[0],
        });
      }
      
      Object.keys(levels).forEach(l => levels[l] = array_unique(levels[l]));
      return [obj, levels];
    },

    createHTMLString: function () {
      const gen_objlist = function (models, style = '') {
        style ? (style = `style="${style}"`) : '';
        let listobj = '';
        if (models) { // ada kemungkinan models undefined karena path "csdb/n219/amm", csdb/n219 nya tidak ada csdbobject nya
          Object.keys(models).forEach(path => {
            const href = '#';
            const model = models[path];
            const isICN = model.filename.substr(0, 3) === 'ICN';
            const logo = isICN ? `<i class="material-symbols-outlined item">mms</i>&#160;` : `<i class="material-symbols-outlined item">description</i>&#160;`;
            const cb = `<span class="cb-window"><input type="checkbox" value="${model.storage}/${path}/${model.filename}"/></span>`;
            listobj = listobj + `
                 <div class="cb-room" ${style}> ${cb}${logo}<a href="${href}" class="filename">${model.filename}</a></div>`
          })
        }
        return listobj
      };
      const path_yang_sudah = [];
      const fn = (start_l = 1, leveldata = {}, dataobj = {}, callback, parentPath = '') => {
        let details = '';
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
            const storage = dataobj[path] ? dataobj[path][0]['storage'] : '#'; // sengaja ambil index ke 0 karena semua csdb storagenya sama
            let isOpen = this.open ? this.open[storage + "/" + path] : false;
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
            // details = details + `
            // <details ${isOpen} class="cb-room" path="${path}">
            //   <summary class="list-none flex">
            //   <span @click.prevent="expandCollapse('${path}')" class="material-symbols-outlined chevron">chevron_right</span> 
            //    ${cbAll}
            //    <a href="#" @click.prevent="$parent.clickFolder({path: '${path}'})">${currFolder}</a>
            //  </summary>`;
            details = details + `
            <details ${isOpen} class="cb-room" path="${storage}/${path}">
              <summary class="list-none flex">
              <i expand-collapse-btn="${storage}/${path}" class="material-symbols-outlined chevron">chevron_right</i> 
               ${cbAll}
               <a href="#" class="folder">${currFolder}</a>
             </summary>`;

            if (leveldata[start_l + 1]) {
              details = details + (callback.bind(this, start_l + 1, leveldata, dataobj, callback, path))();
            }

            // generating obj list
            // details = details + (gen_objlist.bind(this, dataobj[path], `margin-left:${start_l * 3 + defaultMarginLeft + 2}px;`))();
            if(dataobj[path]){
              details = details + (gen_objlist.bind(this, dataobj[path]))();
            }

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
      let data = {"0":{},"1":{}};
      if(e.data.data instanceof Array){
        for (let i = 0; i < e.data.data.length; i++) {
          // const result = await ret.request(e.data.data[i]);
          let result;
          result = await ret.request(e.data.data[i]);
          // console.log((result = await ret.request(e.data.data[i]))[0]);
          // console.log(result);
          data[0] = Object.assign(data[0], result[0]);
          // data[1] = Object.assign(data[1], result[1]);          
          Object.keys(result[1]).forEach(k => {
            data[1][k] = data[1][k] ? data[1][k].concat(result[1][k]) : result[1][k]
          })
          // console.log(data[1][1])
          // data = Object.assign(result, data); 
          // data = Object.assign(data, result); 
          // console.log(data[0], result[0], Object.assign(data[0], result[0]))
          // console.log(e.data.data[i].route.url);
          // console.log(Object.keys(result[0]));
        }
      }
      else {
        data = await ret.request(e.data.data);
      }
      // console.log(top.data = data);
      // console.log(data, data[0], data[1]);
      // console.log(JSON.stringify(data))
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