//load go back
load_code('11');
//upgrade_and_sell
load_code('6');
const harvest_list = ['DarckArcher', 'DarkCaster', 'Ambulance', 'Reacter'];
const compound_list = [
  { name: 'dexring', level: 2 },
  { name: 'intring', level: 2 },
  { name: 'ringsj', level: 3 },
  { name: 'dexamulet', level: 2 },
  { name: 'intamulet', level: 2 },
  { name: 'stramulet', level: 3 }
];
const up_list = [
  { name: 'wgloves', level: 7 },
  { name: 'wgloves', level: 7 },
  { name: 'wattire', level: 7 },
  { name: 'wshoes', level: 7 },
  { name: 'wbreeches', level: 7 },
  { name: 'wcap', level: 7 },
  { name: 'pants1', level: 7 },
  { name: 'gloves1', level: 7 }
];
const store_list = [
  { name: 'candycane' },
  { name: 'token$' },
  { name: 'mistletoe' },
  { name: 'snakefang' },
  { name: 'candy' },
  { name: 'snakeoil' },
  { name: 'ornament' },
  { name: 'pleather' },
  { name: 'carrot' },
  { name: 'bfur' },
  { name: /^x\d/ }
];
const sell_list = [
  { name: 'hpamulet', max_level: 2 },
  { name: 'wbook0', max_level: 2 },
  { name: 'hpbelt', max_level: 2 },
  { name: 'shoes' },
  { name: 'helmet' },
  { name: 'vitring' },
  { name: 'strring' }
];
const exchange_list = ['^gem', 'box$'];
let store_item = list => {
  character.items.forEach((item, index) => {
    list.forEach(target => {
      if (item !== null && item.name.match(target.name) !== null) {
        if (item.level != undefined) {
          if (item.level >= target.level) {
            bank_store(index);
          }
        } else {
          bank_store(index);
        }
      }
    });
  });
};
on_cm = (name, data) => {
  harvest_list.forEach(target => {
    if (target == name) {
      switch (data) {
        case 'needMP':
          game_log(name + ' need mpot');
          let index = locate_item('mpot1');
          if (index !== -1) {
            send_item(name, index, 500);
          }
          break;
        case 'needHP':
          game_log(name + ' need hpot');
          let hpindex = locate_item('hpot1');
          if (hpindex !== -1) {
            send_item(name, hpindex, 500);
          }
          break;
        default:
          game_log(name);
          eval(data);
      }
    }
  });
};
let check_pot = name => {
  send_cm(
    name,
    'if (locate_item("mpot1")==-1||character.items[locate_item("mpot1")].q<500){send_cm("' +
      character.id +
      '","needMP")}'
  );
  send_cm(
    name,
    'if (locate_item("hpot1")==-1||character.items[locate_item("hpot1")].q<500){send_cm("' +
      character.id +
      '","needHP")}'
  );
};
let buy_mpot1 = () => {
  let index = locate_item('mpot1');
  if (index == -1) {
    buy('mpot1', 1500);
  } else if (character.items[index].q < 1500) {
    buy('mpot1', 1500 - character.items[index].q);
  }
};
let buy_hpot1 = () => {
  let index = locate_item('hpot1');
  if (index == -1) {
    buy('hpot1', 1500);
  } else if (character.items[index].q < 1500) {
    buy('hpot1', 1500 - character.items[index].q);
  }
};
let has_respawn = true;
let rip_location = {};
let handle_rip = () => {
  if (character.rip) {
    if (has_respawn === true) {
    }
    respawn();
  } else if (has_respawn === false) {
    has_respawn = true;
    harvesting = false;
    exchanging = false;
    upgrading = false;
  }
};
//send_cm("DarkCaster",'smart_move({x:'+character.x+',y:'+character.y+',map:"'+character.map+'"})')
//return object {"x":1038.6090335612132,"y":-931.431293005814,"map":"cave"}
let where_are_u = (name, on_done) => {
  parent.socket.once('pm', data => {
    console.log(data.owner);
    try {
      console.log(data.message);
      d = JSON.parse(data.message);
      if ('x' in d && 'y' in d && 'map' in d) {
        smart_move(d, on_done);
        finding = true;
        setTimeout(() => {
          finding = false;
        }, 10000);
      }
    } catch (e) {
      console.log(e);
    }
  });
  send_cm(
    name,
    'pm("' +
      character.id +
      '",JSON.stringify({x:character.x,y:character.y,map:character.map}))'
  );
};
let finding = false;
let harvesting = false;
let exchanging = false;
let upgrading = false;
let storing = false;
let last = 'idle';
//where_are_u("DarkCaster")
//where_are_u("DarkCaster",()=>{harvest(harvest_list)})
setInterval(
  () => {
    handle_rip();
    if (character.rip) {
      return;
    }
    if (
      !(harvesting || exchanging || upgrading || storing) ||
      (harvesting &&
        !character.moving &&
        character.going_x == character.x &&
        character.going_y == character.y &&
        !finding)
    ) {
      harvesting = true;
      let harvest_target = harvest_list.shift();
      harvest_list.push(harvest_target);
      game_log('find' + harvest_target);
      where_are_u(harvest_target, () => {
        harvest(harvest_list);
        harvesting = false;
        harvest_list.forEach(name => {
          if (get_player(name) != null) {
            game_log(name);
            check_pot(name);
          }
        });
        use('town');
        smart_move('upgrade');
        game_log('go to upgrade');
        upgrading = true;
      });
    } else if (upgrading) {
      if (
        character.x >= -500 &&
        character.x <= 0 &&
        character.y <= 0 &&
        character.y >= -270
      ) {
        sell_item(sell_list);
        buy_mpot1();
        buy_hpot1();
        let need_compound = compound_list => {
          for (let num = 0; num < compound_list.length; num++) {
            let target = compound_list[num];
            for (let level = 0; level < target.level; level++) {
              let list = [];
              character.items.forEach((item, index) => {
                if (
                  item != null &&
                  item.level != undefined &&
                  item.name == target.name &&
                  item.level == level
                ) {
                  list.push(index);
                }
              });
              if (list.length >= 3) {
                return true;
              }
            }
          }
          return false;
        };
        let need_up = up_list => {
          for (let i = 0; i < character.items.length; i++) {
            let item = character.items[i];
            let result = up_list.reduce((total, now) => {
              if (
                item != null &&
                item.level != undefined &&
                now.name == item.name &&
                now.level > item.level
              ) {
                return total || true;
              }
              return total;
            }, false);
            if (result) {
              return true;
            }
          }
          return false;
        };

        if (
          need_compound(compound_list) ||
          need_up(up_list) ||
          character.q.upgrade
        ) {
          compound_list.forEach(item => {
            compound_level(item.name, item.level);
          });
          up_list.forEach(now => {
            upgrade_level(now.name, now.level);
          });
        } else {
          upgrading = false;
          storing = true;
          game_log('go to exchange');
          smart_move('bank', () => {
            store_item(store_list.concat(up_list, compound_list));
            smart_move('exchange');
            storing = false;
            exchanging = true;
          });
        }
      }
    } else if (exchanging) {
      let keep_exchange = exchange_list.reduce((total, name) => {
        let result = character.items.reduce((finded, item, index) => {
          if (item !== null && item.name.match(name) !== null) {
            exchange(index);
            return true;
          } else {
            return finded;
          }
        }, false);
        return total || result;
      }, false);
      if (!keep_exchange) {
        exchanging = false;
      }
    }
  },

  5000
);
//follow_me(harvest_list)
//check_blue
//send_cm('DarckArcher','pm("'+character.id+'",JSON.stringify({mpot:character.items[locate_item("mpot1")].q}))')
