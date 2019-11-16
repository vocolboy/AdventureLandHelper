/**
 *  Get current map players
 *  取得當前地圖玩家
 *  @returns {Array} players data
 */
const get_current_map_players = () => {
    let players = [];

    Object.keys(parent.entities).forEach(key => {
        let entity = parent.entities[key];
        if (!entity.npc && entity.player) {
            players.push(parent.entities[key])
        }
    });

    return players;
};

/**
 *  Get nearest players
 *  取得附近玩家
 *  @param {Object} {range:100} skill range or attack range
 *  @returns {Array} players data
 */
const get_nearest_players = ({range = character && character.range} = {}) => {
    let players = get_current_map_players();

    players.filter(function (player) {
        let distance = parent.distance(character, player);

        if (distance < range) {
            return true;
        }
    });

    return players;
};

/**
 * Get party list
 * 取得隊員名稱
 * @return {Array} Only players name
 */
const get_party_list = () => parent.party_list;

/**
 * Sort item by name
 * 依造物品名稱排序
 * @returns {void}
 */
const item_sort = () => {
    let items = character.items;
    items.forEach((element, index) => {
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
    items.forEach((item, index) => {
        if (!item.a) return;

        parent.socket.emit("imove", {
            a: item.a,
            b: index
        });

        let moved_item = items.find(moved_item => moved_item.a === index);

        if (!moved_item) return;

        moved_item.a = item.a;
        item.a = 0;
    });
};