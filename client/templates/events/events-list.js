var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.eventsList.rendered = function () {
  if (firstRender) {
    listFadeInHold = LaunchScreen.hold();
    listRenderHold.release();
    firstRender = false;
  }
};

Template.eventsList.helpers({
  eventos: function () {
    return Events.find({ }, { sort: {date: -1}});
  },
  isRPAdmin: function () {
    return Meteor.user().profile.isRPAdmin || Meteor.user().profile.role == 1
  },
  isAdmin: function() {
    return Meteor.user() && Meteor.user().profile.role == 1;
  }
})

Template.eventsList.events({
  'click .btn-edit': function (e) {
    var btn = e.currentTarget
    var eventId = btn.id.substring(9)
    Session.set('EventoSeleccionado', Events.findOne(eventId))
    Router.go('/eventEdit/' + eventId);
  },
  'click .btn-import': function (e) {
    var eventId = e.currentTarget.id.substring(11);
    var evnt = Events.findOne(eventId);
    Session.set('EventoSeleccionado', evnt);
    Session.set('ImportMessages', false);
    Router.go('/eventImport');
  },
  'click .btn-list': function (e) {
    var eventId = e.currentTarget.id.substring(9)
    Session.set('EventoSeleccionado', Events.findOne(eventId))
    Router.go('/attendersList/' + eventId + "/0")
  },
  'click .btn-eliminar': function (e) {
    var id = e.currentTarget.id;
    Session.set('ParametrosConfirmacion', { entidad: 'Evento', id: id });
    $('#modal-confirmacion').modal('show');
  },
  "click .btn-rbi": function(e) {
    console.log(e.currentTarget.id);
    Meteor.call("generarBI", e.currentTarget.id, function(err, resp) {
      if(!err) console.log("Listo");
    });
  }
});