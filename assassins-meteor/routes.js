/**** Routes ****/
Router.configure({
    layoutTemplate: 'main'
});
Router.route('/', {
    name: 'home'
});
Router.route('/create', {
    template: 'create'
});
Router.route('/join', {
    template: 'join'
});
Router.route('/dashboard', {
    template: 'dashboard'
});
Router.route('/pregame', {
    template: 'pregame'
});
Router.route('/nogame', {
    template: 'nogame'
});
Router.route('/init', {
    template: 'init'
});
Router.route('/guess', {
    template: 'guess'
});
