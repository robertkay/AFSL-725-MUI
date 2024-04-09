/* 
mydigitalstructure Local Connector -- http interface for local development
Runs on node
node mydigitalstructure-local.js
sudo killall -9 node
*/

import _ from 'lodash';
import mydigitalstructure from 'mydigitalstructure';
import https from 'http';
import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = {_util: {}, data: {}, http: {port: 3000, host: '127.0.0.1'}, version: '1.0.10'};

app.http.startExpress = function ()
{
    
    app.http.server = express();
    

    app.http.server.use(bodyParser.urlencoded({ limit: '50mb', parameterLimit: 100000, extended: false  }));
    app.http.server.use(bodyParser.json({ limit: '50mb' }));

    app.http.server.get("*", function (httpRequest, httpResponse)
    {
        var url = httpRequest.url;
        console.log('GET ' + url);
        if (url == '') {url = '/index.html'}

		if (url != '')
		{
			if (_.startsWith(url, '/rpc/'))
			{
				app.http.mydigitalstructure(
				{
					httpRequest: httpRequest,
					httpResponse: httpResponse
				});
			}
			else
			{
                if (_.endsWith(url, '/'))
			    {
                    url = _.trimEnd(url, '/') + '.html'
                }
                else if (!_.includes(url, '.'))
                {
                    url = url.split('?')[0];
                    url = '/templates/' + url + '.html' ;
                    console.log(url);
                }

                var settings = mydigitalstructure.get({scope: '_settings'})

                if (_.has(settings, 'local.layout'))
                {
                    const layoutHTML = fs.readFileSync(settings.local.layout, {encoding:'utf8', flag:'r'});
                    const pageHTML = fs.readFileSync(__dirname + '/dist/' + url, {encoding:'utf8', flag:'r'});

                    console.log(layoutHTML);
                    console.log(pageHTML);

                    var responseHTML = _.replace(layoutHTML, '<-mydigitalstructure:content->', pageHTML);
                    httpResponse.write(responseHTML);
                    httpResponse.end()
                }
                else
                {
                    //Check if the url being requested is /site/1751/local-sandbox-param.js, if so we will swap out the param file for the production one.
                    if (settings.mydigitalstructure.hostname.includes('production') && url == '/site/1751/local-sandbox-param.js') {
                        url = '/site/1745/local-param.js'
                    }

                    if (settings.mydigitalstructure.hostname.includes('production') && url.includes('/public/')) {
                        //Serve walnut
                        url = '/assets/walnut_prod.webp';
                    }

                    if (!settings.mydigitalstructure.hostname.includes('production') && url.includes('/public/')) {
                        //Serve walnut
                        url = '/assets/walnut_sandbox.webp';
                    }

                    httpResponse.sendFile(__dirname + '/dist/' + url);
                }
			}
		}
    });

    app.http.server.post("*", function (httpRequest, httpResponse)
    {
        app.http.mydigitalstructure(
        {
            httpRequest: httpRequest,
            httpResponse: httpResponse
        });
    });

    var settings = mydigitalstructure.get({scope: '_settings'});
    console.log(settings);

    if (_.has(settings, 'local.port'))
    {
        app.http.port = settings.local.port;
    }

	if (_.has(settings, 'local.host'))
    {
        app.http.host = settings.local.host;
    }

    https.createServer(app.http.server)
        .listen(app.http.port, app.http.host, function (req, res) {
        console.log('mydigitalstructure-local http server running on ' + app.http.host + ':' + app.http.port);
    });
}

app.http.mydigitalstructure = function (param, response)
{
    if (_.isUndefined(response))
    {
        console.log(param.httpRequest.url);
        console.log(param.httpRequest.body);
        
        var url = param.httpRequest.url;
        if (!_.includes(url, '&advanced=1'))
        {
            url = url + '&advanced=1'
        }

        var sendOptions = 
        {
            url: url
        };

        mydigitalstructure.send(sendOptions,
            param.httpRequest.body,
            app.http.mydigitalstructure,
            param);
    }
    else
    {
        param.httpResponse.writeHead(200,
        {
            'content-type': 'application/json; charset=utf-8',
            'access-control-allow-origin': '*',
            'access-control-allow-headers': '*'
        });
        param.httpResponse.write(JSON.stringify(response));
        param.httpResponse.end()
    }
}

mydigitalstructure.init(main)

function main(err, data)
{ 
	if (mydigitalstructure.data.session.status == "OK")
	{
		app.http.startExpress()
	}	
}