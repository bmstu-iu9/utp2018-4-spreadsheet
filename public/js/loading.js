function toLoad() {
    wrapper = document.getElementById('wrap');
    backgr = document.getElementById('load_back');
    if (wrapper.style.display === 'block') {
        wrapper.style.display = 'none';
        backgr.style.display = 'none';
    } else {
        backgr.style.display = 'block';
        wrapper.style.display = 'block';
    }
}
