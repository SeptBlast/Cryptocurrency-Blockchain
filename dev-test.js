const Block = require('./block');

/**
 * For Constant and Hardcoded
 * const block = new Block('foo', 'barr', 'zoo', 'bAZ');
 * console.log(Block.toString());
 * console.log(Block.genesis().toString());
**/

const fooBlock = Block.mineBlock(Block.genesis(), 'foo');
console.log(fooBlock.toString());