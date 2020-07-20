//cm_list is the list of the name who can remote control you ,set the farmer name
let cm_list=["(farmer name)"]
on_cm=(name,data)=>{
	cm_list.forEach(
		(target)=>{
			if (target==name){
				game_log(name)
				eval(data)
			}
		}
	)
	
}

let tribute=(name)=>{
	character.items.forEach(
		(item,index)=>{
			if (item!==null && G.items[item.name].type!=="pot" && G.items[item.name].type!=="elixir"){
				send_item(name,index,item.q)
			}
		
		}
	)
	send_gold(name,character.gold)	
}
