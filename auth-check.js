(function() {
    window.addEventListener('load', function() {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (!isAuthenticated || isAuthenticated !== 'true') {
            window.location.href = 'https://moalamir52.github.io/Yelo/';
        }
    });
})();