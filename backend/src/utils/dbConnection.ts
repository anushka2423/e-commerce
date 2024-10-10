import mongoose from "mongoose"

export const connectDB = (uri: string) => {
    mongoose.connect(uri, {
        dbName: "Ecommerce",
    }).then(connection => console.log(`DB Connected to ${connection.connection.host}`))
    .catch(error => console.log(`error during mongoose connection ${error}`));
}