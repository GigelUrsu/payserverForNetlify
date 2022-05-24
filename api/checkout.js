const stripeAPI = require('../stripe');
const {handleFetchProducts} = require('../firebase/utils');

async function createCheckoutSession(req,res) {
    const domainUrl = process.env.WEB_APP_URLL;
    const { line_items, customer_email } = req.body;
    console.log(line_items)
    if(!line_items) {
        console.log("error no items or email")
        return res.status(400).json({error: 'missing required session parameters' });
    }
    if(!customer_email) {
        console.log("error no items or email")
        return res.status(400).json({error: 'missing required session parameters' });
    }
    const cartIDs = Object.keys(line_items)
    const filters={
        "id":{"operator":"in","value":cartIDs}
    }
    const itemsResult = await handleFetchProducts(filters)
    const itemsToStripe = itemsResult.map(item => {
        return {
            quantity: line_items[item.id],
            price_data: {
                currency: 'usd',
                unit_amount: item.price * 100, //in cents
                product_data: {
                    name: item.name,
                }
            }
        }
    })
    if(!itemsToStripe.length){
        console.log("error no items")
        return res.status(400).json({error: 'missing required session parameters' });
    }
    let session; 
    
    try {
        session = await stripeAPI.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: itemsToStripe,
            customer_email,
            success_url: `${domainUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domainUrl}/canceled`,
            shipping_address_collection: {allowed_countries: ['RO','GB','US']}
        });
        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.log(error)
        res.status(400).json({error: 'an error occured, unable to create session'});
    }
}

module.exports = createCheckoutSession; 