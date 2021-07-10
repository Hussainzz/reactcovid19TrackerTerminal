require('@babel/register')({
    presets:[
        ["@babel/preset-env"],
        ["@babel/preset-react"]
    ],
    plugins:[
        "@babel/plugin-transform-runtime"
    ]
});
global.fetch = require("node-fetch");

require('./dashboard');
