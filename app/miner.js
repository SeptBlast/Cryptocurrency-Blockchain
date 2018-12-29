class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions();
        // include rewards for all the miners
        // create the block having valid transaction
        // synchronize the chains to p2p server
        // clear the transaction pool
        // broadcast to every miner
    }
}

module.exports = Miner;