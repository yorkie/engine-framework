require('../src');

describe('Environment Variables', function() {
    it('Fire.isEditorCore should be true', function() {
        assert(Fire.isEditorCore);
    });
    it('Fire.isNode should be true', function() {
        assert(Fire.isNode);
    });
    it('Fire.isAtomShell should be true', function() {
        assert(Fire.isAtomShell);
    });
    it('FIRE_EDITOR should be true', function() {
        assert(FIRE_EDITOR);
    });
});
