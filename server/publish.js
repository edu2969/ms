FechaEventoActual = function () {
    var fecha = moment()
    if (fecha.get('hour') < 12) fecha.subtract(1, 'd')
    return fecha.startOf('day').hours(0)
}

Meteor.publish('eventos.porIds', function (ids) {
    check(ids, [String]);
    return Events.find({
        _id: {
            $in: ids
        }
    });
});

Meteor.publish('eventos', function () {
    return Events.find({}, {
        limit: 10,
        sort: {
            date: -1
        }
    });
});

Meteor.publishComposite('asistentes', function (eventoId, pagina) {
    let saltos = 20;
    return {
        find: function () {
            return Events.find({
                _id: eventoId
            });
        },
        children: [{
            find: function (e) {
                return Attenders.find({
                    eventId: e._id
                }, { 
                    skip: saltos * pagina, 
                    limit: saltos 
                });
            },
            children: [{
                find: function (a) {
                    return Guests.find({
                        _id: a.guestId
                    });
                }
      }]
    }]
    }
});

Meteor.publish("baneados", function() {
    return Guests.find({ baneado: true });
});

Meteor.publish("top10", function() {
    return Guests.find({}, { sort: { asistencias: 1 }, limit: 20 });
})

/*
 * admin 1
 * guardias 2
 * rps 3
 * rps-eliminados 4
 *
 * */
Meteor.publish('users', function () {
    if (!Meteor.userId()) return [];
    var rol = Meteor.user().profile.role;
    return Meteor.users.find({
        "profile.role": {
            $gte: rol
        }
    }, {
        fields: {
            services: false,
            createdAt: false
        }
    });
});

Meteor.publishComposite("eventoActual", {
    find: function () {
        var fecha = FechaEventoActual()
        var desde = moment(fecha).toDate()
        var hasta = moment(fecha).add(24, 'h').toDate()
        return Events.find({
            date: {
                $gte: desde,
                $lt: hasta
            }
        });
    },
    children: [{
        find: function (evento) {
            return Attenders.find({
                eventId: evento._id
            }, {
                sort: {
                    fecha: 1
                }
            });
        },
        children: [{
            find: function (ra) {
                return Guests.find({
                    _id: ra.guestId
                })
            }
    }]
  }]
});

Meteor.publishComposite('efectividad', function (desde, hasta) {
    return {
        find: function () {
            return Events.find({
                date: {
                    $gte: desde
                },
                date: {
                    $lte: hasta
                }
            });
        },
        children: [{
            find: function (e) {
                return Attenders.find({
                    eventId: e._id
                });
            },
            children: [{
                find: function (a) {
                    return Guests.find({
                        _id: a.guestId
                    });
                }
      }]
    }]
    }
});

Meteor.publish('birps', function (desde, hasta) {
    // Busca eventos entre las fechas
    var eventosIds = Events.find({
        $and: [{
            date: {
                $gte: desde
            }
    }, {
            date: {
                $lte: hasta
            }
    }]
    }).map(function (o) {
        return o._id;
    });
    var rpIds = Meteor.users.find({
        "profile.role": {
            $in: [1, 2, 3]
        }
    }).map(function (u) {
        return u._id;
    });
    // Hace arreglo de llaves con 
    return BIRPs.find({
        $and: [
            {
                eventoId: {
                    $in: eventosIds
                }
            },
            {
                rpId: {
                    $in: rpIds
                }
            },
            {
                asisten: {
                    $gt: 0
                }
            }
    ]
    });
});

Meteor.publishComposite('birpevento', function (eventoId) {
    return {
        find: function() {
            return BIRPs.find({
                eventoId: eventoId
            });
        },
        children: [{
            find: (function(reg) {
                return Meteor.users.find({ _id: reg.rpId }, {
                    fields: {
                        services: false,
                        createdAt: false,
                        emails: false,
                        username: false,
                        "profile.role": false,
                        "profile.isRPAdmin": false,
                        "profile.rut": false
                    }
                })
            })
        }]
    }
});

Meteor.publish('biactual', function () {
    var fecha = FechaEventoActual()
    var desde = moment(fecha).toDate()
    var hasta = moment(fecha).add(24, 'h').toDate()
    var evento = Events.findOne({
        date: {
            $gte: desde,
            $lt: hasta
        }
    });
    if (!evento) return [];
    return BIRPs.find({
        eventoId: evento._id
    });
});