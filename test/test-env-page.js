require('../src');

describe('Environment Variables', function() {
    it('Fire.isEditorCore should be false', function() {
        expect(Fire.isEditorCore).to.be.false;
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
});
