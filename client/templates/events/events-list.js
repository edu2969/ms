var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true,
  collection: Events, 
  subscriptionName: 'eventos.porIds'
};
var fields = ['name'];
EventosSearch = new SearchSource('eventos', fields, options);

Template.eventsList.rendered = function () {
  if (firstRender) {
    listFadeInHold = LaunchScreen.hold();
    listRenderHold.release();
    firstRender = false;
  }
  Session.set('EventSelected', false);
  EventosSearch.search('');
};

Template.eventsList.helpers({
  isLoading: function() {
    return EventosSearch.getStatus().loading;
  },
  eventos: function () {
    return EventosSearch.getData({
      docTransform: function(doc) {
        return _.extend(doc, {
          cliente: function() {
            return { nodata: "Ejemplo" };
          },
          estado: function () {
            return 'Activo';
          }
        })
      },
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "<span style='color: #BF55EC'>$&</span>")
      },
      sort: {date: -1}
    });
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
    Router.go('/attendersList/' + eventId)
  },
  'click .btn-eliminar': function (e) {
    var id = e.currentTarget.id;
    Session.set('ParametrosConfirmacion', { entidad: 'Evento', id: id });
    $('#modal-confirmacion').modal('show');
  },
  'keyup #lupa': _.throttle(function(e) {
    var text = $(e.target).val().trim();
    EventosSearch.search(text);
  }, 200),
  "click .btn-rbi": function(e) {
    console.log(e.currentTarget.id);
    Meteor.call("generarBI", e.currentTarget.id, function(err, resp) {
      if(!err) console.log("Listo");
    });
  }
});