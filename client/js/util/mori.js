// Use the global mori object
const mori = window.mori;

if (!mori) {
    throw new Error('Mori library not loaded. Please ensure mori is properly included in your dependencies.');
}

export default mori; 