require('../src');

describe('Environment Variables', function() {
    it('Fire.isEditorCore should be true', function() {
        expect(Fire.isEditorCore).to.be.true;
    });
    it('Fire.isNode should be true', function() {
        expect(Fire.isNode).to.be.true;
    });
    it('Fire.isAtomShell should be true', function() {
        expect(Fire.isAtomShell).to.be.true;
    });
    it('FIRE_EDITOR should be true', function() {
        expect(FIRE_EDITOR).to.be.true;
    });


    if (Fire.isEditorCore) {
        // test in page-level
        var spawnRunner = require('./lib/spawn-runner');
        spawnRunner(this.title, require('path').resolve(__dirname, 'test-env-page'));
    }
});