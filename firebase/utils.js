const { initializeApp } =require ('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, setDoc} =require ('firebase/firestore');
// const {firebaseConfig} =require ('./config');

const firebaseConfig = {
    apiKey: "AIzaSyC1AGYls4javPhk3qDc_5kGhwo8iFVI9-g",
    authDomain: "react-app-58a3f.firebaseapp.com",
    projectId: "react-app-58a3f",
    storageBucket: "react-app-58a3f.appspot.com",
    messagingSenderId: "1077911005702",
    appId: "1:1077911005702:web:6eeb184b5147c7bcc73187",
    measurementId: "G-89SCNZFBVC"
};
initializeApp(firebaseConfig);

const firestore = getFirestore();

const handleFetchProducts = async(filters) => {
    console.log("HANDLE FETCH PRODUCTS")
    return new Promise((resolve,reject)=>{
        let ref = collection(firestore,"items");
        const queryConstraints = [
            ...filters.id ? [where("id", filters["id"]["operator"], filters["id"]["value"])]: [],
        ]
        if(filters) ref = query(ref, ...queryConstraints)
        getDocs(ref).then(snapshot=>{
            const productsArray = [...snapshot.docs.map(doc =>{
                return {
                    ...doc.data(),
                    documentID: doc.id
                }
            })]
            resolve(productsArray);
        }).catch(err => {
            reject(err);
        })
    })
}

const handleCreateTransaction = async (session,itemsData) => {
    console.log("HANDLE CREATE TRANSACTION")
        if(!session) 
            return('no items or session')
        // let ref = collection(firestore,"transactions",`${session.payment_intent}`);
        await setDoc(doc(firestore, "transactions", `${session.payment_intent}`), {
            "aAaFastDATA":{
                "email":session.customer_details.email,
                "name":session.customer_details.name,
                "postal_code":session.shipping.address.postal_code,
                "city":session.shipping.address.city,
                "country":session.shipping.address.country,
                "amount_subtotal":session.customer_details.amount_subtotal,
                "amount_total":session.customer_details.amount_total,
                "payment_method_types":session.payment_method_types,
                "payment_status":session.payment_status,
                "amount_shipping":session.total_details.amount_shipping,
                "items":[...itemsData.map((item,index)=>{
                    return {"itemName":item.description,"quantity":item.quantity}
                })],
                statusOrder:"placed",
                "date":Date.now()
            },
            ...session,
            ...itemsData,
            statusOrder:"placed"
        });
        return(session)
}

// module.exports = handleFetchProducts;
exports.handleFetchProducts = handleFetchProducts;
exports.handleCreateTransaction = handleCreateTransaction;

