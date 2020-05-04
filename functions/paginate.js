/* eslint-disable promise/catch-or-return */
const { last, dropRight } =  require('lodash');

let allEntry =  [];
let firstEntry = [];
let lastEntry;

const getPrevData = (db) => {
  const entarr = [];
  this.firstEntry = dropRight(this.firstEntry);
  const firstEntry = last(this.firstEntry);
  // eslint-disable-next-line promise/always-return
  db.collection('products').orderBy('price').startAt(firstEntry).limit(10).get().then((d) => {
    // eslint-disable-next-line array-callback-return
    d.docs.map(a => {
      entarr.push(a.data());
      this.allEntry = entarr;
      });
    // eslint-disable-next-line promise/always-return
    }).then(() => {
      db.collection('products').doc(entarr[entarr.length - 1]['key']).onSnapshot(da => {
        this.lastEntry = da;
      });
    });
  }

  const getNextData = (db) => {
    const entarr = [];
    // eslint-disable-next-line promise/always-return
    db.collection('products').orderBy('price').startAfter(this.lastEntry).limit(10).get().then((data) => {
      // eslint-disable-next-line array-callback-return
      data.docs.map(a => {
        entarr.push(a.data());
        this.allEntry = entarr;
      });
    // eslint-disable-next-line promise/always-return
    }).then(() => {
      db.collection('products').doc(entarr[entarr.length - 1]['key']).onSnapshot(data => {
        this.lastEntry = data;
      });
    // eslint-disable-next-line promise/always-return
    }).then(() => {
      db.collection('tasks').doc(entarr[0]['key']).onSnapshot(da => {
        this.firstEntry.push(da);
      });
    });
  }

  const getMainEntry = (db) => {
    return db.collection('products', ref => ref.orderBy('price').limit(10)).valueChanges().subscribe(data => {
      console.log("========",data);
      this.allentry = data;
      db.collection('products').doc(data[data.length - 1]['key']).onSnapshot(c => {
        this.lastentry = c;
        db.collection('products').doc(data[0]['key']).onSnapshot(da => {
          this.firstEntry.push(da);
        });
      });
    });
    }

  module.exports = {
    Prev:getPrevData,
    Next:getNextData,
    LoadMain: getMainEntry
  }