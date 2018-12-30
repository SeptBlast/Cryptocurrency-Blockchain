const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions();
        validTransactions.push(
            Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
        );
        // include rewards for all the miners
        // create the block having valid transaction
        const block = this.blockchain.addBlock(validTransactions);
        // synchronize the chains to p2p server
        this.p2pServer.syncChains();
        // clear the transaction pool
        this.transactionPool.clear();
        // broadcast to every miner
        this.p2pServer.broadcastClearTransactions();

        return block;
    }
}

module.exports = Miner;