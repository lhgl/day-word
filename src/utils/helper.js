module.exports = {
    formatDate: function(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    },
    generateId: function() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }
};