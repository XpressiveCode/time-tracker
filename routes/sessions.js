var express = require('express');
var router = express.Router();

var sa = require('superagent');

router.post('/', function(req, res){
    req.session.user = null;
    req.session.is_valid = false;

    var base_url = 'https://api.assembla.com/v1/';

    var api_key = req.body.api_key;
    var api_secret = req.body.api_secret;

    sa.get(base_url + '/user.json')
        .set('X-Api-Key', api_key)
        .set('X-Api-Secret', api_secret)
        .end(function(err, response){
            if(err)return res.send(500, err);

            if(response.body.error){
                return res.send(500, response.body.error_description);
            }

            req.session.user = response.body;
            req.session.user.api_key = api_key;
            req.session.user.api_secret = api_secret;
            req.session.is_valid = true;
            req.session.notification = {
                type: 'success',
                title: 'Welcome',
                msg: response.body.name
            };
            return res.json(response.body);
        });
});

module.exports = router;
