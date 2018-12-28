/**
 *
 const Block = require('./block');

 For Constant and Hardcoded
 const block = new Block('foo', 'barr', 'zoo', 'bAZ');
 console.log(Block.toString());
 console.log(Block.genesis().toString());

 const fooBlock = Block.mineBlock(Block.genesis(), 'foo');
 console.log(fooBlock.toString());
 */


 const Blockchain = require('./blockchain');

 const bc = new Blockchain();

 for (let i=0; i<5; i++){
    console.log(bc.addBlock(`foo ${i}`).toString());
 }