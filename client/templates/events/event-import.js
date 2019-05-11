Template.eventImport.helpers({
  evento: function () {
    var e = Session.get('EventoSeleccionado');
    if (e) return e;
  },
  messages: function () {
    var messages = Session.get('ImportMessages');
    return messages;
  }
});

Template.eventImport.events({
  'click #btn-import': function () {
    var messages;

    var eventSelected = Session.get('EventoSeleccionado');
    
    var totalImported = 0;

    var text2Import = $('#ruts-2-import').val().trim();

    if (text2Import.length == 0) {
      messages = {
        danger: []
      };
      messages.danger.push({
        item: 'Se requieren datos para importar'
      });
      Session.set('ImportMessages', messages);
      return;
    }
    var entradas = text2Import.split(/\r\n|\n|\r/);
    //console.log('Evaluando: [' + text2Import + ']');
    var fechaEvento;

    $('#ruts-2-import').val('');

    //console.log('calling processListImport: [' + entradas + '][' + eventSelected._id + ']');
    Meteor.call('processListImport', entradas, eventSelected._id, function (err, data) {
      if (err) {
       // console.log('Error in processListImport: ' + err);
      } else {
        Session.set('ImportMessages', data);
        $('#ruts-2-import').val(data.wrongRuts);
      }
    });
  }
});