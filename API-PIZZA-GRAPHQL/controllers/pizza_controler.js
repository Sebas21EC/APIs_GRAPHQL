const { db } = require("../config/conection.js");

const pizza_controller = {
  Query: {
    async mensaje() {
      return "Bienvenido a la API de Pizzas";
    },

    async pizzas(root, { id }) {
      if (id == undefined) {
        return await db.any("SELECT * FROM pizza  ");
      } else {
        return await db.any("SELECT * FROM pizza WHERE piz_id = $1", [id]);
      }

      //   const pizza = [
      //     {
      //       piz_id: 1,
      //       piz_name: "Pizza de Jamon",
      //     },
      //   ];
      //   return pizza;
    },

    async ingredientes(root, { id }) {
      if (id == undefined) {
        return await db.any("SELECT * FROM ingredient  ");
      } else {
        return await db.any("SELECT * FROM ingredient WHERE ing_id = $1", [id]);
      }
    },
  },

  pizza: {
    async piz_total_calories(pizza) {
      const total_calorias = await db.oneOrNone(
        `select piz.piz_id , sum (pin.pizi_quantity * ing.ing_calories) as total_calories from pizza piz,pizza_ingredient pin, ingredient ing
      where piz.piz_id = pin.piz_id and pin.ing_id=ing.ing_id and piz.piz_id=$1
      group by piz.piz_id;`,
        [pizza.piz_id]
      );
      // console.log(total_calorias.total_calories);
      return total_calorias == null ? 0 : total_calorias.total_calories;
    },

    async piz_ingredients(pizza) {
      const pizza_ingredient = await db.any(
        `select ing.*,pin.pizi_quantity 
        from pizza piz,pizza_ingredient pin, ingredient ing
        where piz.piz_id = pin.piz_id and pin.ing_id=ing.ing_id and piz.piz_id=$1;`,
        [pizza.piz_id]
      );

      return pizza_ingredient;
    },

    ///actualizar la pizza y sus ingredientes
    // async piz_update_and_ingredients(pizza) {
    //   const update_piz = await db.one(
    //     `UPDATE pizza SET piz_name=$2,piz_origin=$3 WHERE piz_id=$1 RETURNING *`,
    //     [pizza.piz_id, pizza.piz_name, pizza.piz_origin]
    //   );

    //   if (
    //     pizza.piz_ingredients_ids != undefined &&
    //     pizza.piz_ingredients_ids.length > 0
    //   ) {
    //     //listar los ingredientes recibidos y si existen en mi base, actualizarlos a mi pizza en la tabla pizza_ingrediente.

    //     await db.none(`DELETE FROM pizza_ingredient WHERE piz_id=$1`, [
    //       pizza.piz_id,
    //     ]);
    //     pizza.piz_ingredients_ids.forEach(async (ing_id) => {
    //       const ing = await db.oneOrNone(
    //         `SELECT * FROM ingredient WHERE ing_id=$1`,
    //         [ing_id]
    //       );
    //       if (ing != null) {
    //         await db.none(
    //           `INSERT INTO pizza_ingredient (piz_id,ing_id,pizi_quantity) VALUES ($1,$2,$3)`,
    //           [pizza.piz_id, ing_id, 0]
    //         );
    //       } else {
    //         console.log("ingrediente no existe");
    //         //await db.none(`INSERT INTO pizza_ingredient (piz_id,ing_id,pizi_quantity) VALUES ($1,$2,$3)`,[pizza.piz_id,ing_id,0]);
    //       }
    //     });
    //   }
    // },
  },

  Mutation: {
    //Piza
    /** *hace el delete y el update*/

    async createPizza(root, { pizza }) {
      try {
        if (pizza === undefined) {
          return "No se ha enviado la pizza";
        } else {
          const new_pizza = await db.one(
            `INSERT INTO pizza (piz_name,piz_origin) VALUES ($1,$2) RETURNING *`,
            [pizza.piz_name, pizza.piz_origin]
          );
          if (
            pizza.piz_ingredients_ids != undefined &&
            pizza.piz_ingredients_ids.length > 0
          ) {
            pizza.piz_ingredients_ids.forEach(async (ing_id) => {
              await db.none(
                `INSERT INTO pizza_ingredient (piz_id,ing_id,pizi_quantity) VALUES ($1,$2,$3)`,
                [new_pizza.piz_id, ing_id, 0]
              );
            });
          }
        }
        return new_pizza;
      } catch (error) {
        return error;
      }
    },

    async update_pizza(root, { pizza }) {
      try {
        if (pizza===undefined) {
            return null
        } else {
            const updatePizza = await db.one(`UPDATE pizza
                    SET piz_name=$2, piz_origin=$3
                    WHERE piz_id = $1
                    returning *`, [pizza.piz_id, pizza.piz_name, pizza.piz_origin])
            
            db.none("DELETE FROM pizza_ingredient WHERE piz_id=$1",[pizza.piz_id])
            
            if (pizza.piz_ingredientsIds.length > 0) {
                pizza.piz_ingredientsIds.forEach(element => {
                    db.none (`INSERT INTO pizza_ingredient(piz_id, ing_id, pizi_quantity)
                            VALUES ($1, $2, $3)`, [pizza.piz_id, element.ing_id, element.pizi_quantity])
                });
            }

            return updatePizza
        }
    } catch (error) {
        return error
    }
    },

    async delete_pizza(root, { id }) {
      try {
        if (id === undefined) {
          return "No se ha eliminado la pizza";
        } else {
          try {
            db.none(`DELETE FROM pizza_ingredient WHERE piz_id=$1`, [id]);
          } catch (error) {}

          const delete_piz = await db.one(
            `DELETE FROM pizza WHERE piz_id=$1 RETURNING *`,
            [id]
          );
          return "Piza eliminada correctamente";
        }
      } catch (error) {
        return error;
      }
    },

    //Ingrediente
    async create_ingredient(root, { ingredient }) {
      try {
        if (ingredient === undefined) {
          return "No se ha enviado la pizza";
        } else {
          console.log(ingredient);
          const new_ing = await db.one(
            `INSERT INTO ingredient (ing_name,ing_calories) VALUES ($1,$2) RETURNING *`,
            [ingredient.ing_name, ingredient.ing_calories]
          );

          return new_ing;
        }
      } catch (error) {
        return error;
      }
    },

    async delete_ingredient(root, { id }) {
      try {
        if (id === undefined) {
          return "No se ha eliminado la ingrediente";
        } else {
          try {
            db.none(`DELETE FROM pizza_ingredient WHERE ing_id=$1`, [id]);
          } catch (error) {}

          const delete_piz = await db.one(
            `DELETE FROM ingredient WHERE ing_id=$1 RETURNING *`,
            [id]
          );
          return "Ingrediente eliminada correctamente";
        }
      } catch (error) {
        return error;
      }
    },
  },
};

module.exports = pizza_controller;
