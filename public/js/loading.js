'use strict';

const toLoad = () => {
    const wrapper = document.getElementById('wrap');
    const backgr = document.getElementById('load_back');
    const body = document.getElementsByTagName('body')[0];
    if (wrapper.style.display === 'block') {
        body.style.overflow = 'auto';
        wrapper.style.display = 'none';
        backgr.style.display = 'none';
    } else {
        body.style.overflow = 'hidden';
        backgr.style.display = 'block';
        wrapper.style.display = 'block';
    }
}