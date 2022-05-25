const stripeAPI = require('../stripe');
const {handleCreateTransaction} = require('../firebase/utils');

async function webhook(req,res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try{
        event = stripeAPI.webhooks.constructEvent(
            req['rawBody'], sig, 'whsec_a7ec0781d95d37ad1c368ae462c51a4b7e0d5f1a335b1b52a92ad48267320262');
    } catch(error){
        return res.status(400).send(`webhook error ${error.message}`);
    }

    if(event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // const sessionResult = await handleCreateTransaction(session);
        if(session){
            console.log('Event data', session);

            stripeAPI.checkout.sessions.listLineItems(
                `${session.id}`,
                { limit: 5 },
                function(err, lineItems) {
                  console.log(lineItems.data)
                  handleCreateTransaction(session,lineItems.data);
                }
              );
            }
        return res.status(200).end();
    }
}

module.exports = webhook;