import date from 'date-and-time';

/**
 * class ini akan di pasang di setiap vue createApp
 */
class WindowCache {

  constructor() {
    document.addEventListener('cache-window', (e) => {
      this.#cache(e.data.component);
    });
    document.addEventListener('open-cached-window', (e) => {
      this.#create(e.data.appId);
    });
  }

  #cache(component) {
    const props = new Map();
    const handleChildren = (children) => {
      if (children.constructor.name === 'Array') {
        children.forEach(child => {
          // child.__v_isVNode === true
          if (child.component) {
            props.set(child.component.uid, child.component.props);
          };
          if (child.children) handleChildren(child.children);
        });
      }
    }
    handleChildren(component._.root.subTree.children);

    const appId = component._.root.appContext.app.appId;
    const obj = {
      uid: component._.root.uid, // bukan app uid tapi first/root component uid
      name: component._.appContext.app.name,
      // title: '',
      last_saved: date.format(new Date(), 'ddd, MMM DD YYYY HH:mm:ss'),
      url: new URL(window.location.href),
      props: component._.root.props,
      child: Object.fromEntries(props.entries()),
    }

    const cached = JSON.parse(localStorage.getItem('cached-window')) ?? {};
    cached[appId] = obj;
    localStorage.setItem('cached-window', JSON.stringify(cached));

    top.props = props;
    return;
  }

  #create(appId) {    
    const cached = JSON.parse(localStorage.getItem('cached-window'))[appId]
    top.history.pushState({},"",cached.url)
    const evt = new Event("new-window");
    evt.data = {
      config: {
        window: {
          appId: appId,
          uid: cached.uid,
          name: cached.name,
          loadFromCache: true,
          props: cached.props,
        },
        task: {
          title: cached.name,
        }
      }
    };
    // top.mainApp.config.globalProperties.$window.create(create);
    top.dispatchEvent(evt);

  }
}

/**
 * on beforeCreate, run >>> useCache.apply(this);
 */
function useCache() {
  if (this._.appContext.app.loadFromCache) {
    const appId = this._.appContext.app.appId
    const cached = JSON.parse(localStorage.getItem('cached-window'))[appId];
    const rootPrevUid = cached.uid;
    const rootCurrUid = this._.root.uid;
    const selisihUid = rootPrevUid - rootCurrUid;
    const curUid = this._.uid;
    const cachedProps = cached.child[curUid + selisihUid];
    Object.keys(this._.props).forEach(keys => {
      this._.props[keys] = cachedProps[keys];
    })
  }
}

export {useCache}

const cache = {
  install: (app) => {
    app.config.globalProperties.$cache = new WindowCache;
  }
}

export default cache;