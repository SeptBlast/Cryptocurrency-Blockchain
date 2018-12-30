const Transaction = require('./transaction');
const Wallet = require('./index');
const { MINING_REWARD } = require('../config');

describe('Transaction', () => {
    let transaction, wallet, recipient, amount;

    beforeEach(() => {
        wallet = new Wallet();
        amount = 50;
        recipient = 'jhssi79345bk3';
        transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it ('Output the `amount` subtracted from the wallet balance', () => {
       expect (transaction.output.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount); 
    });

    it ('output the `amount` added to the recipient', () => {
        expect(transaction.output.find(output => output.address === recipient).amount).toEqual(amount);
    });

    it ('inputs the balace of the wallet', () => {
        expect(transaction.input.amount).toEqual(wallet.balance);
    });

    it ('validates a valid transaction', () => {
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    it ('invalidate a corrupt transaction', () => {
        transaction.output[0].amount = 50000;
        expect(Transaction.verifyTransaction(transaction)).toBe(false);
    });

    describe('transection with an amount that exceed the balance', () =>{
       beforeEach(() => {
           amount = 50000;
           transaction = Transaction.newTransaction(wallet, recipient, amount);
       });

       it('does not create the transecction', () => {
           expect(transaction).toEqual(undefined);
       });
   }); 

   describe ('and updating a transaction', () => {
       let nextAmount, nextRecipient;

       beforeEach(() => {
           nextAmount = 20;
           nextRecipient = 'jnsheis8efsef-fbf';
           transaction = transaction.update(wallet, nextRecipient, nextAmount);
       });

       it ('substract the next ammount from the senders output', () => {
           expect(transaction.output.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount - nextAmount);
       });

       it ('outputs an amount for the next recipient', () => {
           expect(transaction.output.find(output => output.address === nextRecipient).amount).toEqual(nextAmount);
       });
   });

   describe('creating a rewardtransaction', () => {
       beforeEach(() => {
           transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
       });

       it(`rewards the miner's wallet`, () => {
           expect(transaction.output.find(output => output.address === wallet.publicKey).amount).toEqual(MINING_REWARD);
       });
   });
});