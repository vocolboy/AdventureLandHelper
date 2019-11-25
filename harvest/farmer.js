let harvest=(list)=>{
	list.forEach(
	    (name)=>{
		    send_cm(name,'tribute("'+character.name+'")')
	    }
    )
}
let follow_me=(list)=>{
    list.forEach(
        (name)=>{
            send_cm(name,'smart_move({x:'+character.x+',y:'+character.y+',map:"'+character.map+'"})')
        }
    )
}
let compound_level=(id,max_level)=>{
	for (let level=0;level<max_level;level++){
		let list=[]
		character.items.forEach(
			(item,index)=>{
				if(item!=null && item.level!=undefined && item.name==id && item.level==level){
					list.push(index)
				}
			}
        )
        if (Math.floor((list.length/3))>0){
            //choose scroll level
            let scroll_level="cscroll0"
            switch (item_grade({name:id})){
                case 0:
                    if (level>2){
                        scroll_level="cscroll1"
                    }
                    scroll_level="cscroll0"
                break
                case 1:
                    scroll_level="cscroll1"
                break
                case 2:
                    scroll_level="cscroll2"
                break
                default:
                    game_log("wrong grade item")
                    return
            }
            let scroll_num=locate_item(scroll_level)
            if (scroll_num==-1){
                buy(scroll_level,1)
                .catch(
                    e=>{
                        game_log(e.reason)
                    }
                )
                .then(
                    v=>{
                        scroll_num=v.num
                        game_log("success buy cscroll")
                        compound(list[0],list[1],list[2],scroll_num)
                    }
                )
			}else{
                compound(list[0],list[1],list[2],scroll_num)
            }
        }
	}
}
// setInterval(()=>{
// 	compound_level("wbook0",3)
// 	compound_level("ringsj",3)
// 	compound_level("hpamulet",3)
// 	compound_level("hpbelt",3)
// },3000)
let upgrade_level=(id,max_level)=>{
    if(character.q.upgrade) return-1;
	let upgrade_item=async (item,max_level)=>{
        if (item.index===undefined || item.name===undefined || item.level===undefined)return -1
		if (character.q.upgrade) return item.level;
        if (item.level==max_level)return max_level;
        //choose scroll
        let scroll_level=undefined
        switch (item_grade(item)){
            case 0:
                if (item.level>3){
                    scroll_level="scroll1"
                }else{
                    scroll_level="scroll0"
                }
            break
            case 1:
                scroll_level="scroll1"
            break
            case 2:
                scroll_level="scroll2"
            break
            default:
                game_log("Don't know grade")
                return -1
        }
        let buy_scroll_and_upgrade=async (item,scroll)=>{
            let scroll_num=locate_item(scroll)
            if (scroll_num==-1){
                const s=await buy(scroll,1)
                scroll_num=s.num
            }
            return await upgrade(item.index,scroll_num)
        }
        buy_scroll_and_upgrade(item,scroll_level)
        .then(
            (result)=>{
                if (result.success){
                    return item.level+1
                }else{
                    game_log("item broken")
                    return -1
                }
            }
        )
        .catch(
            (err)=>{
                game_log(err)
                return -1
            } 
        )
        
    }   
    for (let i=0;i<42;i++){
        let item=character.items[i]
        if (item!==null && item.name==id && item.level<max_level){
            game_log("find:"+item.name+" level:"+item.level)
            return upgrade_item({name:item.name,level:item.level,index:i},max_level)
        }
    }
}
//usage:
//sell_item("gslime")
//sell_item(["gslime","hpamulet"])
//sell_item([{name:"gslime"},{name:"hpamulet",max_level:"2"}])
let sell_item=(sell_list)=>{
    //preprocessing 
    let list=[]
    switch (typeof(sell_list)){
        case 'object':
            if ("name" in sell_list){
                list.push(sell_list);
            }
            break;
        case 'string':
            list.push({name:sell_list});
            break;
        case 'array':
            sell_list.forEach(
                data=>{
                    if (tyepof(data)=='string'){
                        list.push({name:data})
                    }else if (tyepof(data)=='object'){
                        if ("name" in data){
                            list.push(data);
                        }
                    }
                }
            )
            break;
        default:
            return
    }

    for(let i=0;i<41;i++){
        for (let j=0;j<list.length;j++){
            if(character.items[i]==null){
				continue
			}
            let item=list[j]
            let ch_item=character.items[i]
            if (ch_item.name==item.name){
                if("max_level" in item){
                    if(item.max_level>ch_item.level){
                        game_log("sell item:"+item.name)
                        sell(i,ch_item.q)
                    }
                }else{
                    game_log("sell item:"+item.name)
                    sell(i,ch_item.q)
                }
            }
        }
    }
}


