var sa = require('superagent');
var moment = require('moment');

var assembla = {
    base_url: 'https://api.assembla.com/v1/'
};

assembla.getSpaces = function(key, secret, next){
    sa.get(this.base_url + 'spaces.json')
        .set('X-Api-Key', key)
        .set('X-Api-Secret', secret)
        .end(function(err, resp){
            var spaces = (err ? [] : resp.body);

            var i = 0;
            spaces.forEach(function(space){
                space.state = 'default';
                space.due_date = '';

                assembla.getTickets(key, secret, space.id, function(tickets){
                    space.tickets = tickets;

                    // sort and also get ticket with closest due date
                    if(space.tickets.length) {

                        // add due date
                        space.tickets.forEach(function (ticket) {
                            ticket.due_date = null;
                            ticket.state = 'default';

                            if (ticket.custom_fields && ticket.custom_fields["Due Date"]) {
                                var d = moment(ticket.custom_fields["Due Date"]);
                                ticket.due_date = d;
                                ticket.due_date_str = ticket.due_date.fromNow();

                                var diff = ticket.due_date.diff(moment(), 'days');

                                if(diff < 0){
                                    ticket.state = 'danger';
                                }else if(diff < 5){
                                    ticket.state = 'warning';
                                }
                            }
                        });

                        // sort
                        space.tickets.sort(function (t1, t2) {
                            if (t1.due_date > t2.due_date) return -1;
                            if (t1.due_date < t2.due_date) return 1;
                            return 0;
                        });

                        space.due_date = space.tickets[0].due_date_str;
                        space.state = space.tickets[0].state;
                    }

                    i++;

                    if(i == spaces.length){
                        if(next){
                            next(spaces);
                        }
                    }
                });
            });
        });
};

assembla.getTickets = function(key, secret, space_id, next){
    sa.get(this.base_url + '/spaces/' + space_id + '/tickets/my_active.json')
        .set('X-Api-Key', key)
        .set('X-Api-Secret', secret)
        .end(function(err, resp){
            var tickets = (err ? [] : resp.body);
            if(!tickets.length)tickets = [];

            /*tickets = tickets.filter(function(ticket){
                return ticket.space_id == req.params.id;
            });*/

            if(next){
                next(tickets);
            }
        });
}

module.exports = assembla;