Template.topNav.events({
  'click #btn-nav-add-event': function (e) {
    e.preventDefault();
    Session.set('EventoSeleccionado', false);
    Router.go('/eventEdit/0');
  },
  'click #go-bi': function (e) {
    e.preventDefault();
    var desde = moment().subtract(1, 'month').format('DD-MM-YYYY');
    var hasta = moment().format('DD-MM-YYYY');
    Router.go('/bi/' + desde + '/' + hasta);
  }
});

Template.topNav.helpers({
  isAdmin: function () {
    return Meteor.user() && Meteor.user().profile.role == 1
  },
  isRPAdmin: function () {
    return Meteor.user() && ( Meteor.user().profile.isRPAdmin || Meteor.user().profile.role == 1 );
  },
  isOwner: function () {
    return Meteor.user() && ( Meteor.user().profile.role == 2 || Meteor.user().profile.role == 1 );
  },
  accessManager: function () {
    return Meteor.user() && ( Meteor.user().profile.role <= 2 || Meteor.user().profile.isRPAdmin );
  }
});