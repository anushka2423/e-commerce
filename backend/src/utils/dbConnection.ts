import mongoose from "mongoose"

export const connectDB = () => {
    mongoose.connect("mongodb://localhost:27017", {
        dbName: "Ecommerce",
    }).then(connection => console.log(`DB Connected to ${connection.connection.host}`))
    .catch(error => console.log(`error during mongoose connection ${error}`));
}