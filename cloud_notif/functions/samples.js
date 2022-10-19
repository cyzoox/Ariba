'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.aggregateRatings = functions.firestore
  .document('credit_logs/{creditLogsId}')
  .onWrite(async (change, context) => {
    // Get value of the newly added rating
    const amountVal = change.after.data().amount * change.after.data().quantity;

    // Get a reference to the restaurant
    const restRef = db
      .collection('customer')
      .doc(change.after.data().customer_id);

    // Update aggregations in a transaction
    await db.runTransaction(async transaction => {
      const restDoc = await transaction.get(restRef);

      // Compute new number of ratings
      const oldCreditBalance = restDoc.data().credit_balance;

      if (change.after.data().unit === 'Kilo') {
        const additional =
          change.after.data().quantity * 0.65 + change.after.data().additional;
        const newCreditBalance = oldCreditBalance + amountVal + additional;

        // Update restaurant info
        transaction.update(restRef, {
          credit_balance: newCreditBalance,
        });
      } else if (change.after.data().unit === 'Tub') {
        const additional =
          change.after.data().quantity * 20 + change.after.data().additional;
        const newCreditBalance = oldCreditBalance + amountVal + additional;

        // Update restaurant info
        transaction.update(restRef, {
          credit_balance: newCreditBalance,
        });
      } else if (change.after.data().unit === 'Tub') {
        const additional =
          change.after.data().quantity * 10 + change.after.data().additional;
        const newCreditBalance = oldCreditBalance + amountVal + additional;

        // Update restaurant info
        transaction.update(restRef, {
          credit_balance: newCreditBalance,
        });
      } else {
        const newCreditBalance = oldCreditBalance + amountVal;

        // Update restaurant info
        transaction.update(restRef, {
          credit_balance: newCreditBalance,
        });
      }
    });
  });

exports.aggregateCreditBalancePayments = functions.firestore
  .document('payment_logs/{paymentLogsId}')
  .onWrite(async (change, context) => {
    // Get value of the newly added rating
    const amountVal = change.after.data().amount;

    // Get a reference to the restaurant
    const restRef = db
      .collection('customer')
      .doc(change.after.data().customer_id);

    // Update aggregations in a transaction
    await db.runTransaction(async transaction => {
      const restDoc = await transaction.get(restRef);

      // Compute new number of ratings
      const oldCreditBalance = restDoc.data().credit_balance;
      const newCreditBalance = oldCreditBalance - amountVal;

      // Update restaurant info
      transaction.update(restRef, {
        credit_balance: newCreditBalance,
      });
    });
  });
