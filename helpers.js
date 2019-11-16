/**
 *  Get nearest players
 *  取得附近玩家
 *  @returns {Array} players data
 */
function getNearestPlayers(){
    let players = [];

    Object.keys(parent.entities).forEach(function(key) {
        if(parent.entities[key].player){ players.push(parent.entities[key])};
    });

    return players;
}