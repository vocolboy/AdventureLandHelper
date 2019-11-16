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
}

//handle if character died go back position
let handle_rip=()=>{
	if (character.rip){
		const x=character.x
		const y=character.y
		const rip_map=character.map
		attack_mode=false
		respawn()
		smart_move({map:rip_map,x:x,y:y},()=>{
			attack_mode=true
		})
	}
}

//auto buy potion default 500 hpot1
let buy_potion_mode=false
let check_potion=()=>{
	if (character.gold<2000){
		return
	}
	let hp_num=0
	let mp_num=0
	character.items.forEach(item=>{if ( item !== null && item.name.match("hpot*") !== null ){hp_num=hp_num+item.q}})
	character.items.forEach(item=>{if ( item !== null && item.name.match("mpot*") !== null ){mp_num=mp_num+item.q}})
	if ((hp_num == 0 || mp_num == 0) && (buy_potion_mode == false) ){
		//go back to buy
		buy_potion_mode=true
		attack_mode=false
		const x=character.x
		const y=character.y
		const last_map=character.map
		smart_move("main",()=>{
			buy("hpot1",500)
			.then(
				data=>{
					game_log("buy 500 hp potion")
					buy("mpot1",500-mp_num)
				}
			)
			.catch(
				data=>{
					buy("hpot1",Math.floor(character.gold/G.items.hpot1.g))
                }
			)
			.then(
				data=>{
					smart_move({map:last_map,x:x,y:y},()=>{
						buy_potion_mode=false;
						attack_mode=true;
						}
					)
				}
			)
		})
	}
	
}
