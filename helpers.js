/**
 *  Get current map players
 *  取得當前地圖玩家
 *
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
 *
 *  @param {Object} args - {range:100} skill range or attack range
 *  @param {number} args.range
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
 *
 * @return {Array} Only players name
 */
const get_party_list = () => parent.party_list;

/**
 * Sort item by name
 * 依造物品名稱排序
 *
 * @returns {void}
 */
const item_sort = () => {
    let items = character.items;
    items.forEach((element, index) => {
        if (!element) {
            items[index] = {
                'name': 'zzz'
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

        parent.socket.emit('imove', {
            a: item.a,
            b: index
        });

        let moved_item = items.find(moved_item => moved_item.a === index);

        if (!moved_item) return;

        moved_item.a = item.a;
        item.a = 0;
    });
};

/**
 *  Fast compound by name
 *  依造物品名稱快速合成
 *
 *  @example fast_compound('ringsj',0,locate_item("cscroll0"));
 *
 *  @param {string} item_name
 *  @param {number} item_lv - you want compound item lv
 *  @param {number} scroll_num
 *  @param {?number} offering_num
 *  @returns {void}
 */
function fast_compound(item_name, item_lv, scroll_num, offering_num) {

    let items = get_items_by_name(item_name, item_lv);

    if (items.length < 3) {
        parent.add_log(`${item_name} item not enough`, colors.code_error);
    }

    parent.compound(items[0].index, items[1].index, items[2].index, scroll_num, offering_num, 'code');
}

/**
 * Get item by name
 * 依造名稱取得物品
 *
 * @param {string} item_name
 * @param {?number} item_lv
 * @returns {Array} items data
 */
const get_items_by_name = (item_name, item_lv = -1) => {

    let items = character.items.map((item, index) => {

        if (item) {
            item.index = index;
        }
        return item;

    }).filter(x => !!x).filter(item => item.name === item_name);

    if (item_lv > -1) {
        items = items.filter(item => {
            return item.level === item_lv;
        })
    }

    return items;
};