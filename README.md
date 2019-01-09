# Step By Step Explanation of the Structure of Blockchain

## Create the Block Class

Create the block class with a file called block.js. Each block has a hash, lastHash, and timestamp attribute. Create block.js In block.js:
```
class Block {
constructor(timestamp, lastHash, hash, data) {
  this.timestamp = timestamp;
  this.lastHash = lastHash;
  this.hash = hash;
  this.data = data;
}
toString() {
  return `Block -
          Timestamp : ${this.timestamp}
 		  Last Hash : ${this.lastHash.substring(0, 10)}
          Hash      : ${this.hash.substring(0, 10)
          Data      : ${this.data}`;
  }
}
```
Test the new block class. Create dev-test.js alongside block.js:
```
const Block = require(‘./block’);
const block = new Block();
const block = new Block(‘foo’, ‘bar’, ‘zoo’, ‘baz’);
console.log(block.toString())
```
In `package.json`, find the scripts section and add:

`
"dev-test": "nodemon dev-test"
`

Then in the command line, run:  `$ npm run dev-test`

## Create the Genesis Block
Every blockchain starts with the "genesis block" - a default dummy block to originate the chain. Add a static genesis function to the `Block` class in `block.js`;

```
static genesis() {
 return new this('Genesis time', '-----', 'first-hash', []);
}
```
Back in dev-test.js, test out the new genesis block:

```
console.log(Block.genesis().toString());
```

`$ npm run dev-test`

## Create the Mine Block
Add a function to add a generate a block based off of some provided `data` to store, and a given `lastBlock`. Call the function `mineBlock`. Generating a block is equated to an act of mining since it takes computational power to "mine" the block. Later on, we’ll make the demand for spending computational power more explicit. Here we're going to add the `static mineBlock()` function to the `Block` class:

```
static mineBlock(lastBlock, data) {
 const timestamp = Date.now();
 const lastHash = lastBlock.hash;
 const hash = ‘todo-hash’;
 return new this(timestamp, lastHash, hash, data);
}
```
Now test the new `mineBlock` function. In dev-test.js, delete all of the lines except for the first line that requires the `Block` class.

```
const fooBlock = Block.mineBlock(Block.genesis(), 'foo');
console.log(fooBlock.toString());
```

## Setup the Blockchain App
Make a directory for the project called blockchian-source. Set up a project in node: `$ mkdir blockchian-source $ cd-chain $ npm init -y` Install nodemon as a development dependency. Nodemon is a node engine with a live development server. `$ npm i nodemon --save-dev`

## SHA256 Hash

A hashing function generates a unique value for the combination of data attributes in the block. The hash for a new block is based on its own timestamp, the data it stores, and the hash of the block that came before it. Install the `crypto-js` module which has the SHA256 (Secure Hashing Algorithm 256-bit) function: `$ npm i crypto-js --save` In `block.js`, require the sha256 from the `crypto-js` module at the top:

```
const SHA256 = require('crypto-js/sha256');
```
Then add a new static hash function to the Block class:

```
static hash(timestamp, lastHash, data) {
 return SHA256(`${timestamp}${lastHash}${data}`).toString();
}
```
Now replace the ‘todo-hash’ stub in the `mineBlock` function:
```
const hash = Block.hash(timestamp, lastHash, data);
```

Check the command line - `npm run dev-test` should still be running. Notice the generated hash of the block.

## Create the Test Block
To enforce code consistency as the project develops, add a true testing environment. Install Jest as development dependency, a test runner for JavaScript: `$ npm i jest --save-dev` Jest finds files with a `test.js` extension. Create a testing file for the block class: Create block.test.js The tests in this file will assert that the block attributes are created properly. In block.test.js:

```
const Block = require('./block');

describe('Block', () => {
  let data, lastBlock, block;

  beforeEach(() => {
    data = 'bar';
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });

  it('sets the `data` to match the input', () => {
    expect(block.data).toEqual(data);
  });

  it('sets the `lastHash` to match the hash of the last block', () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });
});
```

Add the `test` script. In the "scripts" section of package.json:

```
"test": "jest --watchAll"
```
`npm run test` If all goes well, you should see two green check marks.

## Create the Blockchain Class

Create the `Blockchain` that creates a chain based on the `Block` class: Create blockchain.js

```
const Block = require('./block');

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock(data) {
    const block = Block.mineBlock(this.chain[this.chain.length-1], data);
    this.chain.push(block);
    return block;
  }
}

module.exports = Blockchain;
```

## Chain Validation
Chain validation ensures that incoming chains are not corrupt once there are multiple contributors to the blockchain. To validate a chain, make sure it starts with the genesis block. Also, ensure that its hashes are generated properly. In the `Blockchain` class, add an `isValidChain` method:

```
isValidChain(chain) {
  if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;
  for (let i=1; i<chain.length; i++) {
    const block = chain[i];
    const lastBlock = chain[i-1];
    if (
      block.lastHash !== lastBlock.hash ||
      block.hash !== Block.blockHash(block)
    ) {
      return false;
    }
  }
  return true;
}
```

This method depends on a `static blockHash` function in the `Block` class. This will generate the hash of a block based only on its instance. In block.js, in the `Block` class:

```
static blockHash(block) {
  const { timestamp, lastHash, data } = block;
  return Block.hash(timestamp, lastHash, data);
}
```

## Replace Chain
If another contributor to a blockchain submits a valid chain, replace the current chain with the incoming one. Only replace chains that are actually longer than the current chain. Handle this with a `replaceChain` function in the `Blockchain` class:

```
replaceChain(newChain) {
  if (newChain.length <= this.chain.length) {
    console.log('Received chain is not longer than the current chain.');
    return;
  } else if (!this.isValidChain(newChain)) {
    console.log('The received chain is not valid.');
    return;
  }

  console.log('Replacing blockchain with the new chain.');
  this.chain = newChain;
}
```

## Testing Blockchain
To test the blockchain first create blockchain.test.js

```
const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
  let bc;
  beforeEach(() => {
    bc = new Blockchain();
  });

  it('starts with the genesis block', () => {
    expect(bc.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block', () => {
    const data = 'foo';
    bc.addBlock(data);
    expect(bc.chain[bc.chain.length-1].data).toEqual(data);
  });
});
```

`$ npm run test`

## Test Chain Validation
In blockchain.test.js, add a second blockchain instance: let bc, bc2; … bc = new Blockchain(); bc2 = new Blockchain(); Add new unit tests:

```
it('validates a valid chain', () => {
  bc2.addBlock('foo');
  expect(bc.isValidChain(bc2.chain)).toBe(true);
});
it('invalidates a chain with a corrupt genesis block', () => {
  bc2.chain[0].data = 'Bad data';
  expect(bc.isValidChain(bc2.chain)).toBe(false);
});

it('invalidates a corrupt chain', () => {
  bc2.addBlock('foo');
  bc2.chain[1].data = 'Not foo';
  expect(bc.isValidChain(bc2.chain)).toBe(false);
});
```
`$ npm run test`

## Test Replace Chain
Test the new chain replacement functionality. In blockchain.test.js:

```
it('replaces the chain with a valid chain', () => {
  bc2.addBlock('goo');
  bc.replaceChain(bc2.chain);
  expect(bc.chain).toEqual(bc2.chain);
});

it('does not replace the chain with one of less than or equal length', () => {
  bc.addBlock('foo');
  bc.replaceChain(bc2.chain);
  expect(bc.chain).not.toEqual(bc2.chain);
});
```

`$ npm run test`

## Get Blocks
Add the express module to create a Node API: $ npm i express --save Create a blockchain instance in the main app file. Then create a GET request to get the blockchain’s block. In app/index.js:

```
const express = require('express');
const Blockchain = require('../blockchain');
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const bc = new Blockchain();

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.listen(HTTP_PORT, () => console.log(`Listening on port: ${HTTP_PORT}`));
```

Now in package.json, add the start and dev scripts to the “scripts” section:

```
"start": "node ./app",
"dev": "nodemon ./app"
```

`$ npm run dev` Now open the Postman application. Hit localhost:3001, and notice the response. If all goes well, you’ll find the array of blocks of the blockchain.

## Mine Blocks POST
Add a POST request, for users to add blocks to the chain. First install the bodyParser middleware to handle incoming json in express: $ npm i body-parser --save In app/index.js:

```
const bodyParser = require('body-parser');
app.use(bodyParser.json());
…
app.post('/mine', (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);
  res.redirect('/blocks');
});
```
Re-open Postman. Open a tab for a new request. Make sure it’s a POST request. Select body → Raw → json/application. Write in the json to post.

```
{
"data": "foo"
}
```
Enter `localhost:3001/mine` for the endpoint. Send. See the newly posted block in the chain.

## Organize the Project
I feel like I've been making a mess of everything.  Let's do a little cleaning:

* Create /blockchain folder
* Move block.js, block.test.js, blockchain.js, blockchain.test.js to blockchain/
* Rename blockchain.js and blockchain.test.js to index.js and index.test.js
* In index.test.js, update the blockchain requirement: const Blockchain = require('./index');
* Create app/ folder
* Create app/index.js

##Connect to Peers
The same class that creates the original websocket server will be used to connect to existing servers. In p2p-server.js:

```
...
  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    server.on('connection', socket => this.connectSocket(socket));
    this.connectToPeers();
  }

  connectToPeers() {
    peers.forEach(peer => {
      const socket = new Websocket(peer);
      socket.on('open', () => this.connectSocket(socket));
    });
  }
}

module.exports = P2pServer;
```

Start a P2pServer instance. Head to app/index.js, and require the P2pServer module:

```
const P2pServer = require('./p2p-server');
const p2pServer = new P2pServer(bc);
...
// at the very bottom of the script
p2pServer.listen();
```

In one command line tab: `$ npm run dev` In a second command line tab or window: `$ HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev` Expect ‘socket connected’ to print in both tabs. In a third command line tab or window: `$ HTTP_PORT=3003 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev` Expect ‘socket connected’ to be printed two times in each tab. #### Handle Peer Messages Allow the sockets to send messages to each other. In the `P2pServer` class:

```
messageHandler(socket) {
  socket.on('message', message => {
    const data = JSON.parse(message);
    console.log('data', data);
  });
});
```
In this.connectSocket:

```
connectSocket(socket) {
  this.sockets.push(socket);
  console.log('Socket connected');
  this.messageHandler(socket);
  socket.send(JSON.stringify(this.blockchain.chain));
}
```

Kill all the running instances on the command line. Fire up one instance with $ `npm run dev` Grow this blockchain a little. Open Postman, and fire two post requests to the mine endpoint. The endpoint is `localhost:3001/mine`, and the Raw→ Body → Type → application/json: `{ “data”: “foo” }` Send. Send. Run a second instance in a second command line tab: `$ HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev` Observe the received message - the blockchain of the original instance. #### P2P Server Install the Websocket module: `ws`. This will allow us to create real-time connections between multiple users of the blockchain: `$ npm i ws --save` Create a file called p2p-server.js (peer-to-peer) to write the `P2pServer` class. Right now the `P2pServer` class will open a websocket server, waiting for connections.

```
const Websocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

class P2pServer {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.sockets = [];
  }

  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    server.on('connection', socket => this.connectSocket(socket));
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log('Socket connected');
  }
}

module.exports = P2pServer;
```

## Syncronize the Chain
Use the received chain to synchronize chains across all instances with the `replaceChain` function. In the `P2pServer` class, in the `messageHandler` function:

```
messageHandler(socket) {
  socket.on('message', message => {
    const data = JSON.parse(message);
    this.blockchain.replaceChain(data);
  });
});
```
Add a syncChains function to `P2pServer` class. Also cut the existing `socket.send(JSON.stringify(this.blockchain.chain));` code into a helper method called `sendChain`. Then fix the `connectSocket` to use the helper function:

```
sendChain(socket) {
  socket.send(JSON.stringify(this.blockchain.chain));
}

connectSocket(socket) {
  …
  this.sendChain(socket);
}

syncChains() {
  this.sockets.forEach(socket => {
    this.sockets.forEach(socket => this.sendChain(socket));
  });
}
```
Within app/index.js, call syncChains() within the `.post(‘/mine’)` method:

```
app.post(‘/mine’, (req, res) => {
  p2pServer.syncChains();
});
```
Confirm the chain synchronization. Kill all the running instances on the command line. Fire up one instance with `$ npm run dev` Grow this blockchain a little. Open Postman, and fire two post requests to the mine endpoint. The endpoint is `localhost:3001/mine`, and the Raw→ Body → Type → application/json: `{ “data”: “foo” }` Send. Send. Run a second instance in a second command line tab: `$ HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev` Hit `localhost:3002/blocks`. Notice the synchronization. Check that the post method also synchronization. Add a new block, with `localhost:3001/mine`: Hit `localhost:3001/mine` Now `localhost:3002/blocks` and `localhost:3002/blocks` should return the same chain.

## Dynamic Difficulty
Create a system that automatically adjusts the difficulty as more miners are added to the blockchain. In config.js, create a `MINE_RATE` constant to represent the millisecond rate that blocks should be mined:

```
...
const MINE_RATE = 3000;
module.exports = { DIFFICULTY, MINE_RATE };
```
Add difficulty attributes to each block in the chain. In the `Block` class of `block.test.js`:

```
constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
  ...
  this.difficulty = difficulty || DIFFICULTY;
}
...
static hash(timestamp, lastHash, data, nonce, difficulty) {
  return SHA256(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
}

static blockHash(block) {
  const { timestamp, lastHash, data, nonce, difficulty } = block;
  return Block.hash(timestamp, lastHash, data, nonce, difficulty);
}

// Update `toString()`
Difficulty: ${this.difficulty}

`` Update `static genesis()`
return new this('Genesis time', '-----', 'first-hash', [], 0, DIFFICULTY);
```
The difficulty of each block will be based on the difficulty of the block that came before it. Update the `static mineBlock` function:

```
static mineBlock(lastBlock, data) {
 	let hash, timestamp;
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;
    let nonce = 0;

 	do {
    nonce++;
    timestamp = Date.now();
    difficulty = Block.adjustDifficulty(lastBlock, timestamp);
    hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
  } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

  return new this(timestamp, lastHash, hash, data, nonce, difficulty);
  }
```
Add the `adjustDifficulty` function:

```
static adjustDifficulty(lastBlock, currentTime) {
  let { difficulty } = lastBlock;
  difficulty = lastBlock.timestamp + MINE_RATE > currentTime ?
  difficulty + 1 : difficulty - 1;
  return difficulty;
}
```

## Proof of Work
The proof-of-work system will deter dishonest contributors to the blockchain by requiring them to do computational work. In block.js, declare a DIFFICULTY constant - the “difficulty” of the system for mining blocks:
```
// After the imports
const DIFFICULTY = 4;
```
Update the constructor:
```
constructor(timestamp, lastHash, hash, data, nonce) {
  ...
  this.nonce = nonce;
}
```
Update the hash functions:
```
static hash(timestamp, lastHash, data, nonce) {
  return SHA256(`${timestamp}${lastHash}${data}${nonce}`).toString();
}

static blockHash(block) {
  const { timestamp, lastHash, data, nonce } = block;
  return Block.hash(timestamp, lastHash, data, nonce);
}
```
Include the nonce in `toString()`:

```
...
  Nonce   : ${this.nonce}
  Data	  : ${this.data}
```
Include a default nonce for the `genesis` block:

```
static genesis() {
  return new this('Genesis time', '-----', 'f1r57-h45h', [], 0);
}
```

Update the `static mineBlock` function to use the proof-of-work system:

```
static mineBlock(lastBlock, data) {
  const lastHash = lastBlock.hash;
  let hash, timestamp;
  let nonce = 0;

  do {
    nonce++;
    timestamp = Date.now();
    hash = Blockhash = Block.hash(timestamp, lastHash, data, nonce);
  } while (hash.substring(0, DIFFICULTY) !== '0'.repeat(DIFFICULTY));

  return new this(timestamp, lastHash, hash, data, nonce);
}
```

## Test the Dynamic Difficulty
Test difficulty adjustment in `block.test.js`:

```
it('lowers the difficulty for slowly mined blocks', () => {
  expect(Block.adjustDifficulty(block, block.timestamp+360000)).toEqual(block.difficulty-1);
});

it('raises the difficulty for quickly mined blocks', () => {
  expect(Block.adjustDifficulty(block, block.timestamp+1)).toEqual(block.difficulty+1);
});
```

Also update the test that previously depended on `DIFFICULTY`, since blocks have their own `difficulty` attribute:

```
it('generates a hash that matches the difficulty', () => {
 	expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
});
```
Also delete this unnecessary line:
```
const { DIFFICULTY } = require('../config'); // ← remove
```

## Test the Proof of Work
Test the proof-of-work system. First make a config.js file at the root of the project so that the `DIFFICULTY` constant can be shared. Cut and paste the `DIFFICULTY` constant from block.js: Create `config.js`:

```
// cut and paste from block.js
const DIFFICULTY = 4;
module.exports = { DIFFICULTY };
```
In block.js, require the `DIFFICULTY` constant:

```
// at the top
const { DIFFICULTY } = require('../config');
```
Then in block.test.js, add new unit tests:

```
// Next to the other requirements
const { DIFFICULTY } = require('../config');
...
it('generates a hash that matches the difficulty', () => {
  expect(block.hash.substring(0, DIFFICULTY)).toEqual('0'.repeat(DIFFICULTY));
});
```
`$ npm run test`

## Create the Util Key Gen
### ( Be very Precise while understanding it )

To create the keyPair and publicKey objects objects, use a module called ‘elliptic’. Elliptic is a module in node that contains classes and methods that enable elliptic-curve based cryptography. Elliptic cryptography is an advanced mathematical subject, but essentially, it centers around the idea in that it is computationally infeasible and impossibly expensive to guess the answer to a randomly generated elliptic curve. Install elliptic as a dependency on the command line: `$ npm i elliptic --save` With the elliptic module installed, create a new file at the root of the project called chain-util.js. Within chain-util.js, create a ChainUtil class. The class will collect helper methods that expose common functions that wrap around functions from elliptic. A few classes in the project will use these functions. Also create an EC instance:

```
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class ChainUtil {}

module.exports = ChainUtil;
```

Side note: in case you’re wondering, sec stands for standards of efficient cryptography. The p stands for prime, and 256 for 256 bits. In the elliptic-based algorithm itself, a key component is a prime number to generate the curve, and this prime number will be 256 bits, or 32 bytes/characters. K stands for Koblitz which is the name of a notable mathematician in the field of cryptography. And 1 stands for this being the first implementation of the curve algorithm in this standard. Add a new static genKeyPair method to this ChainUtil class, that returns a call to the identically-named genKeyPair method of the ec instance:

```
class ChainUtil {
  static genKeyPair() {
    return ec.genKeyPair();
  }
}
```

Now within the wallet/index.js class, require the ChainUtil class. Use the `static genKeyPair` method to create a `keyPair` object within the constructor of the wallet. And then use this `keyPair` object to set the `publicKey`:

```
const ChainUtil = require('../chain-util');

...
  this.keyPair = ChainUtil.genKeyPair();
  this.publicKey = this.keyPair.getPublic();
```

## Create the Transaction

Transactions objects represent exchanges in the cryptocurrency. They will consist of three primary components: 
* an input field which provides information about the sender of the transaction. 
* output fields which detail how much currency the sender is giving to other wallets, and 
* a unique id to identify the transaction object. 
To generate an `id` for transactions, use a module called uuid which stands for universally unique identifier: `$ npm i uuid --save` Use the new uuid module in `chain-util.js`, and create a `static id` function within the `ChainUtil` class.

```
const uuidV1 = require('uuid/v1');

...

static id() {
  return uuidV1();
}
```

Move on to creating the actual transaction class. Create a transaction.js file within the wallet directory: Create the Transaction class, with the ability to generate a new transaction within `wallet/transaction.js`:

```
const ChainUtil = require('../chain-util');

class Transaction {
  constructor() {
    this.id = ChainUtil.id();
    this.input = null;
    this.outputs = [];
  }

  static newTransaction(senderWallet, recipient, amount) {
    if (amount > senderWallet.balance) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    const transaction = new this();

    transaction.outputs.push(...[
      { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
      { amount, address: recipient }
    ]);

    return transaction;
  }
}

module.exports = Transaction;
```

## Create the Wallet
To extend this blockchain with a cryptocurrency, we’ll need wallet objects. Wallets will store the balance of an individual, and approve transactions (exchanges of currency) by generating signatures. - Create wallet/ - Create wallet/index.js In the default wallet/index.js file, create the Wallet class. Every wallet instance will have three fields. First is a balance, which is set to `INITIAL_BALANCE`. This will variable will be a value every wallet begins with. This helps get the economy flowing. Second, it has a `keyPair` object. The keyPair object will contain methods that can return the private key for the wallet, as well as its public key. Third and finally, it has a publicKey field. The public key also serves as the public address for the wallet, and is what other individuals in the network use to send currency to the wallet.

```
const { INITIAL_BALANCE } = require('../config');

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = null;
    this.publicKey = null;
  }

  toString() {
    return `Wallet -
    publicKey : ${this.publicKey.toString()}
    balance   : ${this.balance}`
  }
}

module.exports = Wallet;
```

Right now, the balance of each wallet has been set to a global variable that doesn’t exist yet. So in config.js, declare the INITIAL_BALANCE, and set it to 500:

```
...
const INITIAL_BALANCE  = 500;

module.exports = { DIFFICULTY, MINE_RATE, INITIAL_BALANCE };
```

## Sign The Transaction

Create the vital input object which provides information about the sender in the transaction. This information includes the sender’s original balance, his or her public key, and most important, his or her signature for the transaction. To generate signatures, the elliptic module gives a convenient sign method within the keyPair object. This takes any data in its hash form, and returns a signature based on the keyPair. Later on, this generated signature and the matching public key can be used to verify the authenticity of the signature. Add this signing feature to the Wallet class called sign. In wallet/index.js:

```
sign(dataHash) {
  return this.keyPair.sign(dataHash);
}
```
Also create a static signTransaction method, that will generate the input object for a transaction:

```
static signTransaction(transaction, senderWallet) {
  transaction.input = {
    timestamp: Date.now(),
    amount: senderWallet.balance,
    address: senderWallet.publicKey,
    signature: senderWallet.sign(transaction.outputs)
  };
}
```
The sign method wants the data to be in a hash. It’s much more efficient to have a hash value with a fixed number of characters, rather than a potentially large object that could be full of long pieces of data. Luckily, there is a hash function that is being used to generate the hashes for blocks in the blockchain. Let’s take advantage of that function, and place it in the ChainUtil class. - Head to block.js. Cut the SHA256 requirement and stick it into the chain util file. Then declare a static hash function within here that takes an arbitrary piece of data, then stringifies it, passes it into the SHA256 hashing function, and returns the string form of the hash object:

```
const SHA256 = require('crypto-js/sha256');
...

static hash(data) {
  return SHA256(JSON.stringify(data)).toString();
}
```
Since we’ve the SHA256 function was removed from the block class, use the new ChainUtil hash method in its place. In block.js, import the ChainUtil class:

```
const ChainUtil = require('../chain-util');
```
Then the static hash function of the block class will call the ChainUtil hash function in place of the previous SHA256 function call:

```
static hash(timestamp, lastHash, data, nonce, difficulty) {
  return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`);
}
```
Do the same thing in the transaction class to create a hash for the transaction outputs. Head to transaction.js. Now within the sign function call from the sender wallet, make sure to create a hash for the transaction outputs, before we generate the signature:

```
signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
```

Lastly, make sure to generate an input by using this function whenever a new transaction is created. Therefore, call the `signTransaction` function in `newTransaction`, passing in the transaction instance, and the senderWallet:

```
Transaction.signTransaction(transaction, senderWallet);
```

## Test Transaction Input
Add a test to make sure that this input object was created along with our transaction. In transaction.test.js:

```
it('inputs the balance of the wallet', () => {
   expect(transaction.input.amount).toEqual(wallet.balance);
});
```
`$ npm run test`

## Test Transaction Updates
Test the new updating functionality. In transaction.test.js:

```
describe('and updating a transaction', () => {
  let nextAmount, nextRecipient;
  beforeEach(() => {
    nextAmount = 20;
    nextRecipient = 'n3xt-4ddr355';
    transaction = transaction.update(wallet, nextRecipient, nextAmount);
  });

  it(“subtracts the next amount from the sender’s output”, () => {
    expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
      .toEqual(wallet.balance - amount - nextAmount);
  });

  it('outputs an amount for the next recipient', () => {
    expect(transaction.outputs.find(output => output.address === nextRecipient).amount)
      .toEqual(nextAmount);
  });
});
```
`$ npm run test`

## Test Transaction Verification
Add some tests to ensure that the signature verification works properly. In transaction.test.js
```
it('validates a valid transaction', () => {
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });

  it('invalidates a corrupt transaction', () => {
    transaction.outputs[0].amount = 50000;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });
```
`$ npm run test`

## Test the Transaction
Create a new file called transaction.test.js: Write the test, transaction.test.js:

```
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('Transaction', () => {
  let transaction, wallet, recipient, amount;
  beforeEach(() => {
    wallet = new Wallet();
    amount = 50;
    recipient = 'r3c1p13nt';
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });

  it('ouputs the `amount` subtracted from the wallet balance', () => {
    expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
      .toEqual(wallet.balance - amount);
  });

  it('outputs the `amount` added to the recipient', () => {
    expect(transaction.outputs.find(output => output.address === recipient).amount)
      .toEqual(amount);
  });

  describe('transacting with an amount that exceeds the balance', () => {
    beforeEach(() => {
      amount = 50000;
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('does not create the transaction', () => {
      expect(transaction).toEqual(undefined);
    });
});
});
```
Make sure to change the testing environment for Jest from the default mode to “node”. In package.json, add this rule:

```
...
"jest": {
"testEnvironment": "node"
},
```
`$ npm run test`

## Transaction Updates
To handle the addition of new output objects to an existing transaction, define a function in the Transaction class called update. In transaction.js:

```
update(senderWallet, recipient, amount) {
  const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

  if (amount > senderOutput.amount) {
    console.log(`Amount: ${amount} exceeds balance.`);
    return;
  }

  senderOutput.amount = senderOutput.amount - amount;
  this.outputs.push({ amount, address: recipient });
  Transaction.signTransaction(this, senderWallet);

  return this;
}
```

## Verify Transactions
Now that transactions generate signatures based upon their outputs and their private keys, provide a way to verify the authenticity of those signatures. Within Chain Util, we’ll provide a new static method called verifySignature. In chain-util.js:

```
static verifySignature(publicKey, signature, dataHash) {
  return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
}
```

Utilize this method within the transaction class to will the entire transaction. Make a static function called verifyTransaction. Go to transaction.js:

```
static verifyTransaction(transaction) {
  return ChainUtil.verifySignature(
    transaction.input.address,
    transaction.input.signature,
    ChainUtil.hash(transaction.outputs)
  );
}
```

## Get Transactions
By giving each of users their own wallet, users of the application will have the ability to conduct transactions with each other, thus putting the cryptocurrency into action. Start in the index file of the app directory, where holds the main code for the interactive application: - Go to app/index.js

```
...
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');

...
const wallet = new Wallet();
const tp = new TransactionPool();

...
app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});
```

`$ npm run dev` - hit localhost:3001/transactions

### Handle Messages in P2P Server
Update the messageHandler in the peer to peer server to handle different types of messages. In p2p-server.js:

```
messageHandler(socket) {
  socket.on('message', message => {
    const data = JSON.parse(message);
    switch(data.type) {
      case MESSAGE_TYPES.chain:
        this.blockchain.replaceChain(data.chain);
        break;
      case MESSAGE_TYPES.transaction:
        this.transactionPool.updateOrAddTransaction(data.transaction);
        break;
    }
  ...
}
```

Now in app/index.js, use the broadcastTransaction function in the ‘/transact’ endpoint. That way, transactions are broadcasted to the network whenever new ones are made:

```
p2pServer.broadcastTransaction(transaction);
```
Now start up a couple instances to test the new endpoint: `$ npm run dev` Second command line tab: `$ HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev` Then post transactions. Hit localhost:3001/transact. Select POST for the type of request, and make sure the type of data is Raw, application/json. Then have a json body that consists of an arbitrary recipient, and a value around 50:
```
{
  "recipient": "foo-address",
  "amount": 50
}
```

With those inputs loaded in, go ahead and click `Send` a couple times. Hit the transactions endpoint on both instances: - `localhost:3001/transactions` - `localhost:3002/transactions` Make a second POST transaction, this time with the second instance, `http://localhost:3002/transact`:

```
{
  "recipient": "bar-address",
  "amount": 40
}
```

Hit the transactions endpoint on both instances: - `localhost:3001/transactions` - `localhost:3002/transactions`

## POST Transactions
Create the equivalent method that actually adds new transactions to the transaction pool, in `app/index.js`:

```
app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, tp);
  res.redirect('/transactions');
});
```

`$ npm run dev` Test a POST request in postman, with raw application/json set as the Body data. Use some json similar to this for the data:

```
{
  "recipient": "foo-address",
  "amount": 50
}
```
Hit the endpoint a couple times

## Public Key Endpoint
Make a new get request, under the endpoint, public-key to expose the address of an instance:

```
app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});
```

### Test Transaction Pool
Test the Transaction Pool by creating a file called transaction-pool.test.js alongside the transaction-pool.js file.

```
const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('TransactionPool', () => {
  let tp, wallet, transaction;
  beforeEach(() => {
    tp = new TransactionPool();
    wallet = new Wallet();
    transaction = Transaction.newTransaction(wallet, 'r4nd-4dr355', 30);
    tp.updateOrAddTransaction(transaction);
  });

  it('adds a transaction to the pool', () => {
    expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
  });

  it('updates a transaction in the pool', () => {
    const oldTransaction = JSON.stringify(transaction);
    const newTransaction = transaction.update(wallet, 'foo-4ddr355', 40);
    tp.updateOrAddTransaction(newTransaction);
    expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id)))
      .not.toEqual(oldTransaction);
  });
});
```
`$ npm run test`

## Test Wallet Transactions
Create wallet/index.test.js

```
const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');

describe('Wallet', () => {
  let wallet, tp;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
  });

  describe('creating a transaction', () => {
    let transaction, sendAmount, recipient;
    beforeEach(() => {
      sendAmount = 50;
      recipient = 'r4nd0m-4ddr3s';
      transaction = wallet.createTransaction(recipient, sendAmount, tp);
    });

    describe('and doing the same transaction', () => {
      beforeEach(() => {
        wallet.createTransaction(recipient, sendAmount, tp);
      });

      it('doubles the `sendAmount` subtracted from the wallet balance', () => {
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
        .toEqual(wallet.balance - sendAmount*2);
      });

      it('clones the `sendAmount` output for the recipient', () => {
        expect(transaction.outputs.filter(output => output.address === recipient)
          .map(output => output.amount)).toEqual([sendAmount, sendAmount]);
      });
    });
  });
});
```

`$ npm run test`

## Add to Transaction Pool
A transaction pool will collect all transactions submitted by individuals in the cryptocurrency network. Then, miners will do the work of taking transactions from the pool and including them in the blockchain. Create the transaction pool in the wallet directory with a file called `transaction-pool.js`:

```
class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    let transactionWithId = this.transactions.find(t => t.id === transaction.id);
    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
    } else {
      this.transactions.push(transaction);
    }
  }
}

module.exports = TransactionPool;
```

The `updateOrAddTransaction` method by default will add an incoming transaction to the transactions array. However, there is the possibility that a transaction could come in that already exists in the array. Why? Recall that there is the ability to update transactions to have additional outputs. This means that a transaction could exist in the pool. However, if it gets updated, and is resubmitted to the pool, that transaction shouldn’t appear twice.

## Transaction Pool to P2P Server
Create the equivalent method that actually adds new transactions to the transaction pool, in app/index.js:

```
app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, tp);
  res.redirect('/transactions');
});
```
`$ npm run dev` Test a POST request in postman, with raw application/json set as the Body data. Use some json similar to this for the data:

```
{
  "recipient": "foo-address",
  "amount": 50
}
```
Hit the endpoint a couple times

## Transactions with Wallet
Create transactions with the Wallet class. Define a new method within the Wallet class called createTransaction with three parameters, a recipient, the amount for the transaction, and a transactionPool object. The function will assume an `existingTransaction` function exists for the transactionPool, to help replace existing transactions in the pool: In `wallet/index.js`:

```
createTransaction(recipient, amount, transactionPool) {
  if (amount > this.balance) {
    console.log(`Amount: ${amount}, exceeds current balance: ${this.balance}`);
    return;
  }

  let transaction = transactionPool.existingTransaction(this.publicKey);
  if (transaction) {
    transaction.update(this, recipient, amount);
  } else {
    transaction = Transaction.newTransaction(this, recipient, amount);
    transactionPool.updateOrAddTransaction(transaction);
  }

  return transaction;
}
```

Make sure to import the Transaction class in `wallet/index.js`

```
const Transaction = require('./transaction');
```
Add the existingTransaction function to transaction-pool.js:

```
existingTransaction(address) {
   return this.transactions.find(transaction => transaction.input.address === address);
 }
 ```

## Create the Miner Class
Create a Miner class to tie all the concepts together. Create `app/miner.js`:

```
class Miner {
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mine() {
    const validTransactions = this.transactionPool.validTransactions();
    // include a reward transaction for the miner
    // create a block consisting of the valid transactions
    // synchronize chains in the peer-to-peer server
    // clear the transaction pool
    // broadcast to every miner to clear their transaction pools
  }
}

module.exports = Miner;
```

## Grab Valid Transactions
The first step to writing the mine function that we have in the Miner class is to add a validTransactions function for the TransactionPool. With this validTransactions function, return any transaction within the array of transactions that meets the following conditions. First, its total output amount matches the original balance specified in the input amount. Second, we’ll also verify the signature of every transaction to make sure that the data has not been corrupted after it was sent by the original sender. Add a function called validTransactions to `transaction-pool.js`:

```
validTransactions() {
  return this.transactions.filter(transaction => {
    const outputTotal = transaction.outputs.reduce((total, output) => {
      return total + output.amount;
    }, 0);

    if (transaction.input.amount !== outputTotal) {
      console.log(`Invalid transaction from ${transaction.input.address}.`);
      return;
    }

    if (!Transaction.verifyTransaction(transaction)) {
      console.log(`Invalid signature from ${transaction.input.address}.`)
      return;
    };

    return transaction;
  });
}
```

Note that there is a dependency though on the Transaction class. So import the Transaction class at the top of the file:

`jsconst Transaction = require('../wallet/transaction');`

## Test Valid Transactions
Test the validTransactions function with transaction-pool.test.js. There is actually a feature that can shorten down on the number of lines. Recall that there is a function within the wallet class create a transaction based on a given address, amount, and transaction pool. The createTransaction also does the job of adding the created transaction to the pool. This is what is already done manually by creating the transaction and adding it to the pool. So we can reduce this with one call to wallet.createTransaction, and the same random address, amount, and tp transaction pool instance:

```
// remove → transaction = Transaction.newTransaction(wallet, 'r4nd-4dr355', 30);
// remove → tp.updateOrAddTransaction(transaction);
transaction = wallet.createTransaction('r4nd-4dr355', 30, bc, tp);
```

To begin testing the validTransactions functionality, create a situation where there is a mix of valid and corrupt transactions. Capture the scenario with a new describe block:

```
describe('mixing valid and corrupt transactions', () => {
  let validTransactions;
  beforeEach(() => {
    validTransactions = [...tp.transactions];
    for (let i=0; i<6; i++) {
      wallet = new Wallet();
      transaction = wallet.createTransaction('r4nd-4dr355', 30, bc, tp);
      if (i%2==0) {
        transaction.input.amount = 9999;
      } else {
        validTransactions.push(transaction);
      }
    }
  });

  it('shows a difference between valid and corrupt transactions', () => {
    expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
  });

  it('grabs valid transactions', () => {
    expect(tp.validTransactions()).toEqual(validTransactions);
  });
});
```
`$ npm run test`

Hope this structure will help you in moving forward with Blockchain.

Copyright © 2018 Devesh Kumar - Inc
