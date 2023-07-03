const { db } = require("../config/conection.js");

const blog_controller = {
  Query: {
    async mensaje() {
      return "Bienvenido a la API de Blogs";
    },

    async publications(root, { id }) {
      if (id == undefined) {
        const publications = await db.any("SELECT * FROM publicacion");
        return publications;
      } else {
        const publications = await db.any(
          "SELECT * FROM publicacion where pub_id=$1",
          [id]
        );
        return publications;
      }
    },
    async comments(root, { id }) {
      if (id == undefined) {
        const comments = await db.any("SELECT * FROM comentario");
        return comments;
      } else {
        const comments = await db.any(
          "SELECT * FROM comentario where com_id=$1",
          [id]
        );
        return comments;
      }
    },

    async authors(root, { id }) {
      if (id == undefined) {
        const authors = await db.any("SELECT * FROM autor");
        return authors;
      } else {
        const authors = await db.any("SELECT * FROM autor where aut_id=$1", [
          id,
        ]);
        return authors;
      }
    },

    async reactions(root, { id }) {
      if (id == undefined) {
        const reactions = await db.any("SELECT * FROM reaccion");
        return reactions;
      } else {
        const reactions = await db.any("SELECT * FROM reaccion where rea_id=$1", [
          id,
        ]);
        return reactions;
      }
    },

    async categories(root, { id }) {
      if (id == undefined) {
        const categories = await db.any("SELECT * FROM categoria");
        return categories;
      } else {
        const categories = await db.any("SELECT * FROM categoria where cat_id=$1", [
          id,
        ]);
        return categories;
      }
    },
  },

  category: {
    async publications(category) {
      const category_publication = await db.any(
        "select cat.*, pub.* from categoria cat, publicacion pub where cat.cat_id = pub.cat_id and cat.cat_id=$1;",
        [category.cat_id]
      );
      return category_publication;
    }
  },

  publication: {
    async comments(publication, { id }) {
      const comentario_publication = await db.any(
        "select com.*,aut.* from publicacion pub, comentario com, autor aut where pub.pub_id = com.pub_id and com.pub_id=$1;",
        [publication.pub_id]
      );
      return comentario_publication;
      

    },

        // comments: async (publication) => {
    //   const comments = await db.any(
    //     "select com.*,aut.* from publicacion pub, comentario com, autor aut where pub.pub_id = com.pub_id and pub.pub_id=$1;",
    //  [publication.pub_id]
    //   );
    //   return comments;
    // }


    async post_comments(publication, { id }) {

      const post_comments = await db.any(
        "select com.* from publicacion pub, comentario com where pub.pub_id = com.pub_id and pub.pub_id=$1;",
        [publication.pub_id]
      );
      return post_comments;
    },

    async number_comments(publication) {
      const number_comments = await db.oneOrNone(
        "select pub.pub_titulo, count(com.*) as number from publicacion pub, comentario com where pub.pub_id = com.pub_id and pub.pub_id=$1 group by pub.pub_titulo;",
        [publication.pub_id]
      );
      return number_comments==null?0:number_comments.number;
    },

    // async number_of_comment_authors (comment) {
    //   const number_of_comment_authors = await db.oneOrNone(
    //     "select pub_id, count(*) as number from comentario group by pub_id ;",
    //     [comment.pub_id]
    //   );
    //   return number_of_comment_authors==null?0:number_of_comment_authors.number;
    // },
    async category_publication(publication) {
      const category_publication = await db.any(
        "select cat.* from categoria cat, publicacion pub where cat.cat_id = pub.cat_id and pub.pub_id=$1;",
        [publication.pub_id]
      );
      return category_publication;
    },

    async author_publication(publication) {
      const author_publication = await db.any(
        "select aut.* from autor aut, publicacion pub where aut.aut_id = pub.aut_id and pub.pub_id=$1;",
        [publication.pub_id]
      );
      return author_publication;
    },

    async number_publications(publication) {
      const number_publications = await db.oneOrNone(
        "select aut.aut_id, count(pub.*) as number from autor aut, publicacion pub where aut.aut_id = pub.aut_id and aut.aut_id=$1 group by aut.aut_id;",
        [publication.aut_id]
      );
      return number_publications==null?0:number_publications.number;
    },

    async total_likes_in_post_comments (publication) {
      const total_likes_in_post_comments = await db.oneOrNone(
        "select pub.pub_id, count(rea.*) as number from publicacion pub, comentario com, reaccion rea where pub.pub_id = com.pub_id and com.com_id = rea.com_id and pub.pub_id=$1 group by pub.pub_id;",
        [publication.pub_id]
      );
      return total_likes_in_post_comments==null?0:total_likes_in_post_comments.number;
    }
    
  },



  comment: {
    async authors(comment) {
      const author_comment = await db.any(
        "select aut.* from autor aut where aut.aut_id = $1;",
        [comment.aut_id]
      );
      return author_comment;
    },

    async number_likes(comment) {
      const number_likes = await db.oneOrNone(
        "select rea.com_id, count(rea.*) as number from comentario com, reaccion rea where com.com_id = rea.com_id and rea.com_id=$1 group by rea.com_id;",
        [comment.com_id]
      );
      return number_likes==null?0:number_likes.number;
    },

   
    
  },



  author: {
    async publications(author) {
      const author_publication = await db.any(
        "select aut.*, pub.* from autor aut,publicacion pub where aut.aut_id = $1;",
        [author.aut_id]
      );
      return author_publication;
    },
  },



  Mutation: {
    async insert_post_comment(root, { comment }) {
      try {
        // console.log(comment.pub_id);
        // console.log(comment.com_descripcion);
        // console.log(comment.aut_id);

        if (
          comment.pub_id == undefined ||
          comment.com_descripcion == undefined ||
          comment.aut_id == undefined
        ) {
          // console.log("Error: Campos vacios");
          return "Error: Campos vacios";
        } else {
          // console.log("Campos llenos");
          const insert_comment = await db.one(
            `INSERT INTO comentario (pub_id, aut_id, com_descripcion)
             VALUES ($1, $2, $3) RETURNING * ;`,
            [comment.pub_id, comment.aut_id, comment.com_descripcion]
          );
          return insert_comment;
        }
      } catch (error) {
        return "Error: " + error;
      }
    },

    async update_post_comment(root, { comment }) {
      try {
        if (
          comment.com_id == undefined ||
          comment.com_descripcion == undefined ||
          comment.pub_id == undefined ||
          comment.aut_id == undefined
        ) {
          // console.log("Error: Campos vacios");
          return "Error: Campos vacios";
        } else {
          // console.log("Campos llenos");
          const update_comment = await db.one(
            `UPDATE comentario SET com_descripcion = $1 WHERE com_id = $2 and pub_id = $3 and aut_id = $4 RETURNING * ;`,
            [
              comment.com_descripcion,
              comment.com_id,
              comment.pub_id,
              comment.aut_id,
            ]
          );
          return update_comment;
        }
      } catch (error) {
        return "Error: " + error;
      }
    },

    async delete_post_comment(root, { id }) {
      console.log(id);
      try {
        if (id == undefined) {
          // console.log("Error: Campos vacios");
          return "Error: Campos vacios";
        } else {
          console.log("Campos llenos");
          const delete_comment = await db.one(
            `DELETE FROM comentario WHERE com_id = $1 RETURNING * ;`,
            [id]
          );
          return delete_comment;
        }
      } catch (error) {
        return "Error: " + error;
      }
    },
  },
};

module.exports = blog_controller;
