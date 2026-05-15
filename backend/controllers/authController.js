async function loginUser(req, res) {
    const {username, password} = req.body;
    
    // search database for user info
    if (username == "admin" && password == "admin") {
        res.send(true);
    }
    else {
        res.status(401).send("User not found")
    }
    
}

async function registerUser(req, res) {
    const {username, password} = req.body;
    
    // Search for conflicting username
    if (username == "admin") {
        res.status(401).send("username exists already");
    } else {
        res.send(true);
    }
}

async function logoutUser(req, res) {
    req.session.destroy(() => {
        res.send("user logged out");
    });
}

async function getUserInfo(req, res) {
    username = req.body.username;
    res.send({username})
}

module.exports = {
    loginUser, registerUser, logoutUser, getUserInfo
};