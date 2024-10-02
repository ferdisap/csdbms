import HellowWorld from '../vue/components/window/HelloWorld.vue';
import Explorer from '../vue/components/window/Explorer.vue';
import DML from '../vue/components/window/DML.vue';

export default [
  {
    name: 'HelloWorld',
    path: '/',
    component: HellowWorld
  },
  {
    name: 'Explorer',
    path: '/explorer',
    component: Explorer
  },
  {
    name: 'DML',
    path: '/dml',
    component: DML
  },
  // {
  //   name: 'Welcome',
  //   path: '/csdb',
  //   component: Welcome
  // },
  // {
  //   name: 'Explorer',
  //   path: '/csdb/explorer/:filename?/:viewType?',
  //   component: Explorer
  // },
  // {
  //   name: 'Deletion',
  //   path: '/csdb/deletion',
  //   component: Deletion
  // },
  // {
  //   name: 'Dispatch',
  //   path: '/csdb/dispatch/:filename?',
  //   component: Dispatch
  // },
  // {
  //   name: 'Br',
  //   path: '/csdb/br/:filename?',
  //   component: Br
  // }
];