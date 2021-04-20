import Vue from 'vue';
import colorSelect from './colorSelect.vue'
const getColor ={
    install(Vue,options){
        Vue.component(colorSelect.name,colorSelect)
    }
}
if(typeof window !== 'undefined' && window.Vue){
    window.getColor = getColor;
    Vue.use(getColor)
}
export default getColor