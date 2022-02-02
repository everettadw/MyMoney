async function getAllUsers() {
    let response = await postTo("/users", {});
    if ( response.status == 200 ) {
        return response.json();
    } else {
        return null;
    }
}
function wrapLi(innerH) {
    let temp = document.createElement("li");
    temp.innerHTML = innerH;
    return temp;
}

function handlePopulate() {
    el("#users").innerHTML = "";
    getAllUsers()
    .then(response => {
        if ( response == null ) el("#users").innerHTML = "<li><p>No users...</p></li>";
        response.forEach(user => {
            let newUser = document.createElement("li");
            let userDetails = document.createElement("ul");
            userDetails.appendChild(wrapLi("Accounts: " + user['accounts']));
            userDetails.appendChild(wrapLi("Money Sources: " + user['money_sources']));
            newUser.innerHTML = user['username'];
            el("#users").appendChild(newUser);
            el("#users").appendChild(userDetails);
            el("#users").appendChild(wrapLi("<br />"));
        });
    })
}
async function handleSaveAll() {
    for ( let i = 0; i < finances.moneyMoves.length; i++ ) {
        await finances.moneyMoves[i].save();
    }
    handlePopulate();
}
function handleClearAll() {
    postTo('/moneysources/delete-all', {})
    .then(response => {
        if ( response.status == 200 ) {
            return response.json();
        }
        return response;
    })
    .then(json => {
        handlePopulate();
        return json;
    })
}

el("#save-all").addEventListener("click", handleSaveAll, false);
el("#clear-all").addEventListener("click", handleClearAll, false);

window.onload = () => {
    handlePopulate();    
}