const { async } = require("fast-glob");
const { db } = require("../config/conection.js");

const blog_controller = {
  Query: {
    async message() {
      return "Hello World";
    },
    async events(root, { id }) {
      if (id == undefined) {
        const events = await db.any("SELECT * FROM evento");
        return events;
      } else {
        const event = await db.any("SELECT * FROM evento where eve_id=$1", [
          id,
        ]);
        return event;
      }
    },

    async lounges(root, { id }) {
      if (id == undefined) {
        const lounges = await db.any("SELECT * FROM sala");
        return lounges;
      } else {
        const lounge = await db.any("SELECT * FROM sala where sal_id=$1", [id]);
        return lounge;
      }
    },

    async participants(root, { id }) {
      if (id == undefined) {
        const participants = await db.any("SELECT * FROM participante");
        return participants;
      } else {
        const participant = await db.any(
          "SELECT * FROM participante where par_id=$1",
          [id]
        );
        return participant;
      }
    },
    async participating_events(root, { par_id, eve_id }) {
      if (par_id == undefined || eve_id == undefined) {
        const participating_events = await db.any(
          "SELECT * FROM evento_participante"
        );
        return participating_events;
      } else {
        const participating_event = await db.any(
          "SELECT * FROM evento_participante where par_id=$1 AND eve_id=$2",
          [par_id, eve_id]
        );
        return participating_event;
      }
    },
  },

  lounge: {
    async events(lounge) {
      const events = await db.any(
        "select * from evento eve, sala sal where eve.sal_id=sal.sal_id and eve.sal_id=$1;",
        [lounge.sal_id]
      );
      return events;
    },
  },

  event: {
    async participating_event(event) {
      const participating_events = await db.any(
        "select * from evento_participante evepar where evepar.eve_id=$1;",
        [event.eve_id]
      );
      return participating_events;
    },

    async participants(event) {
      const participants = await db.any(
        "select par.* from evento eve, evento_participante evepar, participante par  where eve.eve_id=evepar.eve_id and par.par_id=evepar.par_id and eve.eve_id=$1;",
        [event.eve_id]
      );
      return participants;
    },

    async lounges(event) {
      const lounge = await db.any(
        "select sal.* from evento eve, sala sal where eve.sal_id=sal.sal_id and eve.eve_id=$1;",
        [event.eve_id]
      );
      return lounge;
    },
  },

  participant: {
    async participating_events(participant) {
      const participants = await db.any(
        "select * from evento_participante evepar where evepar.par_id=$1;",
        [participant.par_id]
      );
      return participants;
    },
  },

  participating_event: {
    async participants_events(participant, event) {
      console.log(participant.par_id, event.eve_id);
      const participants = await db.any(
        "select * from evento_participante evepar where evepar.par_id=$1 and evepar.eve_id=$2;",
        [participant.par_id, event.eve_id]
      );
      return participants;
    },
    async participants(participating_event) {
      const participants = await db.any(
        "select par.* from evento eve, evento_participante evepar, participante par  where eve.eve_id=evepar.eve_id and par.par_id=evepar.par_id and evepar.par_id=$1;",
        [participating_event.par_id]
      );
      return participants;
    },
    async events(participating_event) {
      const events = await db.any(
        "select eve.* from evento eve, evento_participante evepar, participante par  where eve.eve_id=evepar.eve_id and par.par_id=evepar.par_id and evepar.eve_id=$1;",
        [participating_event.eve_id]
      );
      return events;
    },
  },

  /// Mutaciones
  Mutation: {
    async insert_event(root, { event }) {
      try {
        if (
          event.sal_id == undefined ||
          event.eve_nombre == undefined ||
          event.eve_costo == undefined
        ) {
          console.log("Campos vacios");
          return "Error: Faltan datos";
        } else {
          console.log("Campos llenos");
          const insert_event = await db.one(
            `INSERT INTO evento (sal_id, eve_nombre, eve_costo) VALUES ($1, $2, $3) RETURNING *`,
            [event.sal_id, event.eve_nombre, event.eve_costo]
          );
          return insert_event;
        }
      } catch (error) {
        return "Error: " + error;
      }
    },

    async update_event(root, { event }) {
      try {
        if (
          event.eve_id == undefined ||
          event.sal_id == undefined ||
          event.eve_nombre == undefined ||
          event.eve_costo == undefined
        ) {
          console.log("Campos vacios");
          return "Error: Faltan datos";
        } else {
          console.log("Campos llenos");
          const update_event = await db.one(
            `UPDATE evento SET sal_id = $1, eve_nombre = $2, eve_costo = $3 WHERE eve_id = $4 RETURNING *`,
            [event.sal_id, event.eve_nombre, event.eve_costo, event.eve_id]
          );
          return update_event;
        }
      } catch (error) {
        return "Error: " + error;
      }
    },

    async delete_event(root, { eve_id }) {
      try {
        if (eve_id == undefined) {
          console.log("Campos vacios");
          return "Error: Faltan datos";
        } else {
          console.log("Campos llenos");
          const delete_event = await db.one(
            `DELETE FROM evento WHERE eve_id = $1 RETURNING *`,
            [eve_id]
          );
          return delete_event;
        }
      } catch (error) {
        return "Error: " + error;
      }
    },

    async insert_participating_event(root, { participating_event }) {
      try {
        if (
          participating_event.eve_id == undefined ||
          participating_event.par_id == undefined ||
          participating_event.evepar_cantidad == undefined
        ) {
          console.log("Campos vacios");
          return "Error: Faltan datos";
        } else {
          console.log("Campos llenos");
          const insert_participating_event = await db.one(
            `INSERT INTO evento_participante  VALUES ($1, $2,$3) RETURNING *`,
            [
              participating_event.eve_id,
              participating_event.par_id,
              participating_event.evepar_cantidad,
            ]
          );
          return insert_participating_event;
        }
      } catch (error) {
        return "Error: " + error;
      }
    },

    async delete_participating_event(root, { participating_event }) {
      try {
        if (
          participating_event.eve_id == undefined ||
          participating_event.par_id == undefined
        ) {
          console.log("Campos vacios");
          return "Error: Faltan datos";
        } else {
          console.log("Campos llenos");
          const delete_participating_event = await db.one(
            `DELETE FROM evento_participante WHERE eve_id = $1 AND par_id = $2 RETURNING *`,
            [participating_event.eve_id, participating_event.par_id]
          );
          return delete_participating_event;
        }
      } catch (error) {
        return "Error: " + error;
      }
    },
  },
};

module.exports = blog_controller;
