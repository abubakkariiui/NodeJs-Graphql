const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require('./models/event')
const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type Event {
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find().then((events) => {
          return events.map(event=> {
            return {...event._doc, _id: event._doc._id.toString()}
          })
        }).catch((err) => {
          console.log(err);
        })
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        })

        return event.save().then((res) => {
          console.log(res);
          return {...res._doc, _id: event._doc._id.toString()};
        }).catch((err) => {
          console.log(err);
          throw err
        })

      },
    },
    graphiql: true,
  })
);

mongoose
  .connect("mongodb://localhost:27017/graphql")
  .then((res) => {
    console.log("Database Conneted Successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("Connected");
});
