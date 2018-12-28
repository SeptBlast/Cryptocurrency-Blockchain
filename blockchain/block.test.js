const Block = require('./block');
// const { DIFFICULTY } = require('../config');

describe('Block', () => {
    let data, lastBlock, block;
    
    beforeEach(()=>{
        data = 'bar';
        lastBlock = Block.genesis();
        block = Block.mineBlock(lastBlock, data);
    });

    it('sets the `data` to match the input', () => {
        expect(block.data).toEqual(data);
    });

    it('sets the `lasthash` to match the hash of the last block', () => {
        expect(block.lasthash).toEqual(lastBlock.hash);
    });

    it('generates a hash that matches the diffuculty', () => {
        expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
        console.log(block.toString());
    });

    it ('lowers the difficulty for slowly mined blocks', () => {
        expect(Block.adjustDifficulty(block, block.timestamo+360000)).toEqual(block.difficulty-1);
    });

    it ('raises the difficulty for quickly mined blocks', () => {
        expect(Block.adjustDifficulty(block, block.timestamo + 1)).toEqual(block.difficulty - 1);
    });
});