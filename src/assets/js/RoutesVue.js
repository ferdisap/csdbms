import HellowWorld from '../vue/components/window/HelloWorld.vue';
import Explorer from '../vue/components/window/Explorer.vue';
import DML from '../vue/components/window/DML.vue';

export default [
  {
    name: 'HelloWorld',
    path: '/helloworld',
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
];