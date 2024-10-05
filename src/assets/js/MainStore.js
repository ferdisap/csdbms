import { defineStore } from 'pinia';

export const mainStore = defineStore('mainStore', {
  state: () => {
    return {
      componentLoadingProgress: new Map(),
    }
  },
  actions: {
  }
});