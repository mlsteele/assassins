/**** Routes ****/
Router.configure({
    layoutTemplate: 'main'
});
Router.route('/', {
    name: 'home'
});
Router.route('/guess', {
    name: 'guess'
});
