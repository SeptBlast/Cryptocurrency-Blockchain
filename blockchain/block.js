const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(timestamp, lasthash, hash, data) {
        this.timestamp = timestamp;
        this.lasthash = lasthash;
        this.hash = hash;
        this.data = data;
    }

    toString() {
        return `Block - 
            Timestamp: ${this.timestamp}
            Last Hash: ${this.lasthash.substring(0, 10)}
            Hash     : ${this.hash.substring(0, 10)}
            Data     : ${this.data}`;
    }

    static genesis() {
        return new this('Genisis time', '-------', 'f1r57sd-h45f', []);
    }

    static mineBlock(lastBlock, data) {
        const timestamp = Date.now();
        const lasthash = lastBlock.hash;
        const hash = Block.hash(timestamp, lasthash, data);

        return new this(timestamp, lasthash, hash, data);
    }

    static hash(timestamp, lasthash, data) {
        return SHA256(`${timestamp}${lasthash}${data}`).toString();
    }

    static blockHash(block) {
        const {timestamp, lasthash, data} = block;
        return Block.hash(timestamp, lasthash, data); 
    }
}

module.exports = Block;