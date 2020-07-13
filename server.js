require('dotenv').config({silent: true});

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const http = require('http');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Shanghai');
moment.locale('zh-CN');
const serialize = require('serialize-javascript');

app.use('/public', express.static(path.join(__dirname, 'public')));


// 可以考虑放到数据库存储起来，MongoDB
let events = [];

let renderer;

if (process.env.NODE_ENV === 'production') {
    let bundle = fs.readFileSync('./dist/node.bundle.js', 'utf8');
    renderer = require('vue-server-renderer').createBundleRenderer(bundle);
    app.use('/dist', express.static(path.join(__dirname, 'dist')));
}

app.use(require('body-parser').json());
app.post('/add_event', (req, res) => {
    let newEvent = {
        description: req.body.description,
        date: moment(req.body.date)
    }
    events.push(newEvent);
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    let template = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
    let contentMarker = '<!--APP-->';
    if (renderer) {
        renderer.renderToString({events}, (err, html) => {
            if (err) {
                console.log(err);
            } else {
                res.send(template.replace(contentMarker, `<script>var __INITIAL_STATE__ = ${serialize(events)}</script>\n${html}`));
            }
        });
    } else {
        res.send('<p>Awaiting compilation...</p><script src="/reload/reload.js"></script>');
    }

});




const server = http.createServer(app);

if (process.env.NODE_ENV === 'development') {
    const reload = require('reload');
    const reloadServer = reload(app);
    require('./webpack-dev-middleware').init(app, server);
    require('./webpack-server-compiler').init(function (bundle) {
        let needsReload = (renderer === undefined);
        renderer = require('vue-server-renderer').createBundleRenderer(bundle);
        if (needsReload) {
            reloadServer.then(function (reloadReturned) {
                reloadReturned.reload();
            }).catch(function (err) {
                console.log(err)
            })
        }
    });
}

server.listen(process.env.PORT, function () {
    console.log(`Example app listening on port ${process.env.PORT}!`);
    // if (process.env.NODE_ENV === 'development') {
    //   require("open")(`http://localhost:${process.env.PORT}`);
    // }
});
