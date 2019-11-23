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
let has_respawn=true
let rip_location={}
let handle_rip=()=>{
	if (character.rip){
        if (has_respawn===true){
            rip_location={x:character.x,y:character.y,rip_map:character.map}
            attack_mode=false
            has_respawn=false
        }
		respawn()
		
    }else if (has_respawn===false){
        has_respawn=true
        smart_move({map:rip_location.rip_map,x:Math.floor(rip_location.x),y:Math.floor(rip_location.y)},()=>{
			attack_mode=true
        })
        game_log(rip_location.rip_map)
        game_log(rip_location.x)
        game_log(rip_location.y)
    }
}

//auto buy potion default 500 hpot1
let buy_potion_mode=false
let check_potion=(limit={hp:500,mp:500})=>{
	if (character.gold<2000){
		return
    }
    if (limit.hp==undefined){
        limit.hp=500
    }
    if (limit.mp==undefined){
        limit.mp=500
    }
	let hp_num=0
	let mp_num=0
	character.items.forEach(
        item=>{
            if ( item !== null && item.name.match("hpot*") !== null ){hp_num=hp_num+item.q;return;}
            if ( item !== null && item.name.match("mpot*") !== null ){mp_num=mp_num+item.q;return;}
        }
    )
	if ((hp_num == 0 || mp_num == 0) && (buy_potion_mode == false) ){
		//go back to buy
		buy_potion_mode=true
        attack_mode=false
        //record now location
		const x=character.x
		const y=character.y
        const last_map=character.map
        const last_attack_mode=attack_mode
        //default is no hp pot 
        let first_limit=limit.hp
        let first_buy="hpot1"
        let second_buy="mpot1"
        let second_left_num=mp_num
        let second_limit=limit.mp
        if (mp_num==0){
            first_limit=limit.mp
            first_buy="mpot1"
            second_buy="hpot1"
            second_left_num=hp_num
            second_limit=limit.hp
        }
		smart_move("main",()=>{
			buy(first_buy,first_limit)
			.then(
				data=>{
					buy(second_buy,second_limit-second_left_num)
				}
			)
			.catch(
                //buy fall may be not enough money
				data=>{
                    if(data.reason=="cost"){
                        buy(first_buy,Math.floor(character.gold/G.items.hpot1.g))
                    }
                }
			)
			.then(
				data=>{
					smart_move({map:last_map,x:x,y:y},()=>{
						buy_potion_mode=false;
						attack_mode=last_attack_mode;
						}
					)
				}
			)
		})
	}
	
}

//help priest watch party member hp and heal them
let  priest_auto_partyheal=()=>{
    //check character is Periest
    if (character.ctype!="priest"){
        return
    }
    let party_list=parent.party_list;
    let need_healing=false
    party_list.forEach(
        name=>{
            let member=get_entity(name)
            if (member!==undefined){
                if ((member.hp/member.max_hp)<0.5){
                    need_healing=true
                }
            }
        }
    )
    if (need_healing){
        if (character.mp<400){
            use_hp_or_mp()
        }
        use_skill("partyheal")
    }
}


let party_leader_priority=["lulalu","DarckArcher"]
let party_check=()=>{
    if (character.party!=null){
        return
    }
    send
}

