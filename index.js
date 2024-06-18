const express = require("express")
const http = require("http");
const app = express()
const server = http.createServer(app);

const io = require("socket.io")(server, {

    cors: {
        origin: "*"
    }
});
const PORT = process.env.PORT || 4000;


let users = [];

const addUser = (user, socketId) => {
    // console.log("------Test Add user----")
    // console.log(user)
    if (!users.some(currentUser => currentUser.user._id === user._id)) {

        users.push({ user, socketId })

    }

    // console.log(users)
}
const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
    // console.log("-----Test Get User------")
    // console.log(users)
    return users.find(user => user.user._id === userId);
}

io.on("connection", (socket) => {
    //when connect
    console.log("a user connected.")

    //take userId and socketId from user
    socket.on("addUser", user => {
        addUser(user, socket.id);
        io.emit("getOnlineUsers", users)
    });


    //send and get message
    socket.on("sendMessage", ({ sender, receiverId, text }) => {
        const user = getUser(receiverId);
        // console.log(receiverId, user)
        if (user)
            io.to(user.socketId).emit("getMessage", {
                senderId: sender._id,
                profilePicture: sender.profilePicture,
                gender: sender.gender,
                isAdmin: sender.isAdmin,
                text
            });
    })

    socket.on("disconnect", () => {
        //when disconnect
        console.log("a user disconnected")
        io.emit("getOnlineUsers", users)
        removeUser(socket.id)
    })
})

app.get("/", (req, res) => {
    res.send("socket.io server is running");
})

server.listen(PORT, () => console.log("Server is up & running!"))