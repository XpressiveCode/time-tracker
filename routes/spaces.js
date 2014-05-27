var express = require('express');
var router = express.Router();
var moment = require('moment');
var sa = require('superagent');

router.get('/tasks', function(req, res){
    var base_url = 'https://api.assembla.com/v1/';

    var api_key = req.session.user.api_key;
    var api_secret = req.session.user.api_secret;

    sa.get(base_url + 'tasks')
        .set('X-Api-Key', api_key)
        .set('X-Api-Secret', api_secret)
        .end(function(err, response){
            return res.json(response.body);
        });

});

router.get('/:id', function(req, res){
    var base_url = 'https://api.assembla.com/v1/';

    var api_key = req.session.user.api_key;
    var api_secret = req.session.user.api_secret;

    sa.get(base_url + '/spaces/' + req.params.id + '/tickets/my_active.json')
        .set('X-Api-Key', api_key)
        .set('X-Api-Secret', api_secret)
        .end(function(err, response){
            if(err)return res.send(500, err);

            console.log(response.body);

            var tickets = response.body;
            if(!tickets.length)tickets = [];

            tickets = tickets.filter(function(ticket){
               return ticket.space_id == req.params.id;
            });

            return res.render('space', { space_id: req.params.id, tickets: tickets });
        });
});

router.get('/:id/tickets/:ticket_id', function(req, res){
    var base_url = 'https://api.assembla.com/v1/';

    var api_key = req.session.user.api_key;
    var api_secret = req.session.user.api_secret;

    sa.get(base_url + '/spaces/' + req.params.id + '/tickets/id/' + req.params.ticket_id + '.json')
        .set('X-Api-Key', api_key)
        .set('X-Api-Secret', api_secret)
        .end(function(err, response){
            if(err)return res.send(500, err);

            console.log(response.body);

            return res.render('ticket', { space_id: req.params.id, ticket: response.body });
        });
});

router.post('/:id/tickets/:ticket_id', function(req, res){
    var base_url = 'https://api.assembla.com/v1/';

    var api_key = req.session.user.api_key;
    var api_secret = req.session.user.api_secret;

    sa.post(base_url + 'tasks')
        .send({ 'user_task': {
                'user_id': req.session.user.id,
                'space_id': req.params.id,
                'description': req.body.description,
                'hours': req.body.hours,
                'begin_at': moment(req.body.start_date).toJSON(),
                'end_at': moment().toJSON(),
                'ticket_id': req.params.ticket_id
            }
        })
        .set('Content-type', 'application/json')
        .set('X-Api-Key', api_key)
        .set('X-Api-Secret', api_secret)
        .end(function(err, response){
            if(err)return res.send(500, err);

            console.log('ticket: ', response.body);

            req.session.notification = {
                type: 'success',
                title: 'Time Entry has been Added'
            };

            return res.redirect('/spaces/' + req.params.id + '/tickets/' + req.params.ticket_id);
        });

});

module.exports = router;
