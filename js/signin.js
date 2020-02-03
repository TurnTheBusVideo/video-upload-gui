window.onload = event => {
    resetState();
};

function resetState() {
    hideMask();
}

function hideMask() {
    $('#signinMask').attr('hidden', true)
}
