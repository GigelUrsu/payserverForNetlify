const stripeAPI = require('../stripe');
const {handleCreateTransaction} = require('../firebase/utils');

async function webhook(req,res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try{
        event = stripeAPI.webhooks.constructEvent(
            req['rawBody'], sig, 'whsec_8erDFwLiP3tmdtBxDhc3EV8m1itfiTwT');
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
        }
    return res.status(200).end();
}

module.exports = webhook;