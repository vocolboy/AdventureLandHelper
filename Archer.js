const skill_3shot = () => {
  //type:monster
  //target:chracter.id
  is_on_cooldown("3shot")
  let target_list = parent.entities.reduce((total, entity) => {
    if (entity.type == 'monster' && entity.target == character.id) {
      total.push(entity);
      return total;
    }
    return total;
  }, []);
  if (target_list.length >= 2) {
    use_skill('3shot', target_list);
  }else if()
};
