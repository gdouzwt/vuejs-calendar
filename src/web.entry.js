import './style.scss';
import moment from "moment-timezone";

let events = window.__INITIAL_STATE__.map(event => {
    return {
        description: event.description,
        date: moment(event.date)
    }
});

import VueCalendar from './entry'

setTimeout(function () {
    VueCalendar(events).$mount('#app');
}, 2000);
