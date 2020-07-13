import Vue from 'vue'
import './style.scss'
import App from './components/App.vue'

import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Shanghai');
moment.locale(navigator.language)

Object.defineProperty(Vue.prototype, '$moment', {
    get() {
        return this.$root.moment
    }
});

new Vue({
    el: '#app',
    data: {
        moment
    },
    components: {
        App
    }
});
