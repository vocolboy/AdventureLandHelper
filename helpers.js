/**
 *  Get current map players
 *  取得當前地圖玩家
 *  @returns {Array} players data
 */
function get_current_map_players() {
    let players = [];

    Object.keys(parent.entities).forEach(function (key) {
        let entity = parent.entities[key];
        if (!entity.npc && entity.player) {
            players.push(parent.entities[key])
        }
    });

    return players;
}

/**
 *  Get nearest players
 *  取得附近玩家
 *  @returns {Array} players data
 */
function get_nearest_players(args) {
    if (!args) args = {};

    if (!args.range) {
        args.range = character && character.range;
    }

    let players = get_current_map_players();

    players.filter(function (player) {
        let distance = parent.distance(character, player);

        if (distance < args.range) {
            return true;
        }
    });

    return players;
}

/**
 * Get party list
 * 取得隊員名稱
 * @return {Array} Only players name
 */
function get_party_list() {
    return parent.party_list;
}

/**
 * Sort item by name
 * 依造物品名稱排序
 * @returns {void}
 */
function item_sort() {
    let items = character.items;
    items.forEach(function (element, index) {
        if (!element) {
            items[index] = {
                "name": "zzz"
            }
        }
    });

    //bubble sort by name
    let backpack_size = items.length - 1;
    for (let j = 0; j < backpack_size; j++) {
        let done = true;
        for (let i = 0; i < backpack_size - j; i++) {
            if (items[i].name > items[i + 1].name) {
                if (!items[i].a && items[i].name !== 'zzz') {
                    items[i].a = i
                }
                if (!items[i + 1].a && items[i + 1].name !== 'zzz') {
                    items[i + 1].a = i + 1
                }

                let temp = items[i];
                items[i] = items[i + 1];
                items[i + 1] = temp;
                done = false;
            }
        }
        if (done) {
            break;
        }
    }

    //item move
    items.forEach(function (item, index) {
        if (!item.a) return;

        parent.socket.emit("imove", {
            a: item.a,
            b: index
        });

        moved_item = items.find(function (moved_item) {
            return moved_item.a === index;
        });

        if (!moved_item) return;

        moved_item.a = item.a;
        item.a = 0;
    });
}