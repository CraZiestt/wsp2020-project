const functions = require('firebase-functions');
const express = require('express')
const app = express()
const path=require('path')
const paginate = require('./paginate');

exports.httpReq = functions.https.onRequest(app)

app.use(express.urlencoded({extended: false}))
app.use('/public', express.static(path.join(__dirname, '/static')))

//set template engine
app.set('view engine', 'ejs')
//location of ejs files
app.set('views', './ejsviews')

//frontend programming

function frontendHandler(req, res) {
    // eslint-disable-next-line no-path-concat
    res.sendFile(__dirname + '/prodadmin/prodadmin.html')
}
function Converter(req, res) {
    // eslint-disable-next-line no-path-concat
    res.sendFile(__dirname + '/prodadmin/temp.html')
}

app.get('/login', frontendHandler);
app.get('/home', frontendHandler);
app.get('/add', frontendHandler);
app.get('/show', frontendHandler);

//backend programming

const session = require('express-session')
app.use(session(
    {
        secret: 'anysecrestring.fjkdlsaj!!!',
        name: '__session',
        saveUninitialized: false,
        resave: false,
        secure: true, //https
        maxAge: 1000*60*60*2, // 2 hours
        rolling: true, // reset maxAge at every response
    }
))

const firebase = require('firebase')

//Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBgjn8aP3Sz93YCD0aEVeOs6YZ9L-VXJGQ",
    authDomain: "vijayk-wsp20.firebaseapp.com",
    databaseURL: "https://vijayk-wsp20.firebaseio.com",
    projectId: "vijayk-wsp20",
    storageBucket: "vijayk-wsp20.appspot.com",
    messagingSenderId: "480899736064",
    appId: "1:480899736064:web:db1ce65961a9ae85fb6ee5"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const adminUtil = require('./adminUtil.js')
  const Constants = require('./myconstants.js')

  const getTotalProducts = async() => {
    const all_products = [];
    await firebase.firestore().collection(Constants.COLL_PRODUCTS).get()
      // eslint-disable-next-line promise/always-return
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
        all_products.push(doc.data());
      });
    });
    return all_products;
  }

// ATCION : verify token route.
app.get('/verify/:token', async(req,res,next) => {
    await adminUtil.updateVerifyStatus(req.params.token)
    req.session.idToken = null;
    res.render('signin.ejs', {user: false, cartCount: null, error: "Email verified successfully."});  
});

app.get('/', auth, async (req, res) => {
    // console.log('=========', req.decodedIdToken ? req.decodedIdToken.email : 'no user')
    const limit = 10;
    const cartCount = req.session.cart ? req.session.cart.length : 0
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    let products = [];    
    try {
        const max= req.query.max ? parseInt(req.query.max) : 0;
        const min= req.query.min ? parseInt(req.query.min) : 0;
        const page = req.query.page ? req.query.page : '';
        if(page === 'next'){
            const snapshot = await coll.orderBy("price").where('price', '>', max).limit(limit).get()
            snapshot.forEach(doc => {
                products.push({id: doc.id, data: doc.data()})
            })

            let max_val = products.reduce((prev, current) => (prev.price > current.price) ? prev : current);
            let min_val = products.reduce((prev, current) => (prev.price < current.price) ? current : prev);

            res.setHeader('Cache-Control', 'private');
            res.render('storefront.ejs', {error: false, pagination:{max: max_val.data.price, min: min_val.data.price}, products, user: req.decodedIdToken, cartCount});
            return;
        }
        if(page === 'prev'){
            const snapshot = await coll.orderBy("price").where('price', '<', min).limit(limit).get()
            snapshot.forEach(doc => {
                products.push({id: doc.id, data: doc.data()})
            })

            let max_val = products.reduce((prev, current) => (prev.price > current.price) ? prev : current);
            let min_val = products.reduce((prev, current) => (prev.price < current.price) ? current : prev);

            res.setHeader('Cache-Control', 'private');
            res.render('storefront.ejs', {error: false, pagination:{max: max_val.data.price, min: min_val.data.price}, products, user: req.decodedIdToken, cartCount});
            return;
        }
        
        const snapshot = await coll.orderBy("price").limit(limit).get()
        snapshot.forEach(doc => {
            products.push({id: doc.id, data: doc.data()})
        })
        let max_val = products.reduce((prev, current) => (prev.price > current.price) ? prev : current);
        let min_val = products.reduce((prev, current) => (prev.price < current.price) ? current : prev);
        
        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', {error: false, pagination:{max: max_val.data.price, min: min_val.data.price}, products, user: req.decodedIdToken, cartCount});
        return;
    } catch (e) {
        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', {error: e, user: req.decodedIdToken, cartCount})

    }
})

app.get('/b/about', auth, (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    res.setHeader('Cache-Control', 'private');
    res.render('about.ejs', {user: req.decodedIdToken, cartCount})
})

app.get('/b/contact', auth, (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    res.setHeader('Cache-Control', 'private');
    res.render('contact.ejs', {user: req.decodedIdToken, cartCount})
})

app.get('/b/signin', (req, res) => {
    res.render('signin.ejs', {error: false, user: req.decodedIdToken, cartCount: 0})
})

app.post('/b/signin', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const auth = firebase.auth()
    try{
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
        const userRecord = await auth.signInWithEmailAndPassword(email, password)
        const idToken = await userRecord.user.getIdToken()
        await auth.signOut()

        req.session.idToken = idToken

        if (userRecord.user.email === Constants.SYSADMINEMAIL) {
            res.setHeader('Cache-Control', 'private');
            res.redirect('/admin/sysadmin')
        } else {
            if (!req.session.cart) {
                res.setHeader('Cache-Control', 'private');
                res.redirect('/')
        } else {
            res.setHeader('Cache-Control', 'private');
            res.redirect('/b/shoppingcart')
        }
    }
    } catch (e) {
        res.setHeader('Cache-Control', 'private');
        res.render('signin', {error: e, user: null, cartCount: 0})
    }
})

app.get('/b/signout', async(req, res) => {

    req.session.destroy(err => {
        if(err) {
            console.log('==== session.destroy error: ', err)
            req.session = null
            res.send('Error: sign out (session.destroy error')
        } else {
            res.redirect('/')
        }
    })

})

app.get('/b/profile', authAndRedirectSignIn, (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    console.log('====== decodedIdToken', req.decodedIdToken)
    res.setHeader('Cache-Control', 'private');
    res.render('profile', {user: req.decodedIdToken, cartCount, orders: false})
})

app.get('/b/signup', (req, res) => {
    res.render('signup.ejs', {page: 'signup', user: null, error: false, cartCount: 0})
})

const ShoppingCart = require('./model/ShoppingCart.js')

app.post('/b/add2cart', async (req, res) => {
    const id = req.body.docId
    const collection = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try {
        const doc = await collection.doc(id).get()
        let cart;
        if (!req.session.cart) {
            //first time add to cart
            cart = new ShoppingCart()
        } else {
            cart = ShoppingCart.deserialize(req.session.cart)
        }
        const {name, price, summary, image, image_url} = doc.data()
        cart.add({id, name, price, summary, image, image_url})
        req.session.cart = cart.serialize()
        res.setHeader('Cache-Control', 'private');
        res.redirect('/b/shoppingcart')
    } catch(e) {
        res.send(JSON.stringify(e))
        res.setHeader('Cache-Control', 'private');
    }
})

app.get('/b/shoppingcart', authAndRedirectSignIn, (req, res) => {
    let cart
    // console.log(req.session)
    if (!req.session.cart) {
        cart = new ShoppingCart()
    } else {
        cart = ShoppingCart.deserialize(req.session.cart)
    }
    res.setHeader('Cache-Control', 'private');
    res.render('shoppingcart.ejs', {message: false, cart, user: req.decodedIdToken, cartCount: cart.contents.length})
})

app.post('/b/checkout', authAndRedirectSignIn, async (req, res) => {
    if (!req.session.cart) {
        res.setHeader('Cache-Control', 'private');
        return res.send('Shopping Cart is Empty!')
    }

    // data format to store in firestore
    // collection: orders
    // {uid, timestamp, cart}
    // cart = [{product, qty} .....] // contents in shoppingcart

    const data = {
        user: req.decodedIdToken,
        uid: req.decodedIdToken.uid,
        // timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        cart: req.session.cart
    }

    try {
        await adminUtil.checkOut(data)
        req.session.cart = null;
        res.setHeader('Cache-Control', 'private');
        return res.render('shoppingcart.ejs',
         {message: 'Checked Out Successfully!', cart: new ShoppingCart(), user: req.decodedIdToken, cartCount: 0})
    } catch (e) {
        const cart = ShoppingCart.deserialize(req.session.cart)
        res.setHeader('Cache-Control', 'private');
        return res.render('shoppingcart.ejs',
        {message: 'Checked Out Failed. Try Again Later!', cart, user: req.decodedIdToken, cartCount: cart.contents.length}
        )
    }
})

app.get('/b/orderhistory', authAndRedirectSignIn, async (req, res) => {
    try{
        const orders = await adminUtil.getOrderHistory(req.decodedIdToken)
        res.setHeader('Cache-Control', 'private');
        res.render('profile.ejs', {user: req.decodedIdToken, cartCount: 0, orders})
    } catch (e) {
        console.log('========', e)
        res.setHeader('Cache-Control', 'private');
        res.send('<h1> Order History Error </h1>')
    }
})

//middleware
async function authAndRedirectSignIn(req, res, next) {
    try{
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
        if (decodedIdToken.uid) {
            req.decodedIdToken = decodedIdToken
            return next()
        }
    } catch (e) {
        console.log('==== authAndRedirect error', e)
    }

    res.setHeader('Cache-Control', 'private');
    return res.redirect('/b/signin')
}

async function auth(req, res, next) {

    try {
        if(req.session && req.session.idToken){
            const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
            req.decodedIdToken = decodedIdToken
        } else {
            req.decodedIdToken = null
        }
    } catch (e) {
        req.decodedIdToken = null
    }

    next()
}


//admin api 
app.post('/admin/signup', (req, res) => {
    return adminUtil.createUser(req, res)
})

app.get('/admin/sysadmin', authSysAdmin, (req, res) => {
    res.render('admin/sysadmin.ejs')
})

app.get('/admin/listUsers', authSysAdmin, (req, res) => {
    return adminUtil.listUsers(req, res)
})

async function authSysAdmin(req, res, next) {
    try{
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
        if (!decodedIdToken || !decodedIdToken.email || decodedIdToken.email !== Constants.SYSADMINEMAIL) {
            return res.send('<h1>System Admin Page: Access Denied!</h1>')
        }
        if (decodedIdToken.uid) {
            req.decodedIdToken = decodedIdToken
            return next()
        }
        return res.send('<h1>System Admin Page: Access Denied!</h1>')
    } catch (e) {
        return res.send('<h1>System Admin Page: Access Denied!</h1>')
    }
}
//test code

app.get('/testlogin', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/html/login.html'))
})

app.post('/testsignIn', (req,res) => {
    const email = req.body.email
    const password = req.body.pass
    // let page = `
    //     (POST) You entered: ${email} and ${password}
    // `;
    // res.send(page)
    const obj = {
        a: email,
        b: password,
        c: '<h1>login success</h1>',
        d: '<h1>login success</h1>',
        start: 1,
        end: 10
    }
    res.render('home', obj)
})

app.get('/testsignIn', (req, res) => {
    const email = req.query.email
    const password = req.query.pass
    let page = `
        You entered: ${email} and ${password}
    `;
    res.send(page)
})

app.get('/test', (req, res) =>  {
    const time = new Date().toString()
    let page = `
    <h1>Current Time At Server: ${time}</h1>
    `;
    res.header('refresh', 1)
    res.send(page)
})

app.get('/test2', (req, res) => {
    res.redirect('http://www.uco.edu')
})

