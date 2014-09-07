

var Territory = function(){
  this.owner = 0;
  this.defenders = new Defenders();
};

var Defenders = function(){
  this.unit_types = ['wind','water','fire','earth'];
  this.remove_index = parseInt(Math.random()*this.unit_types.length);
  for (var i = 0; i < this.unit_types.length; i++){
    this[this.unit_types[i]] = 0;
  }

  this.defender_health = 100;

  this.add_unit = function(type, ammount){
    this[type] += ammount;
  };

  this.remove_unit = function(type, ammount){
    if (this[type] >= ammount){
      this[type] -= ammount;
    }else{
      ammount = this[type];
      this[type] = 0;
    }
    return ammount;
  };

  this.damage_type = function(type,damage){
    var num_dead = parseInt(damage/100);
    damage -= (num_dead*100);
    this[type] -= num_dead;
    if (this[type] <= 0){
      this[type] = 0;
    }else{
      this.defender_health -= damage;
      if (this.defender_health <= 0){
        this.defender_health += 100;
        this[type]--;
      }
    }
  }

  this.recieve_damage = function(damage){
    if (this.get_total() == 0){return;}
    while(damage > 0){
      if (damage > 100){
        damage -= 100;
        if (this.kill_unit()){damage = 0;}
      }else{
        this.defender_health -= damage;
        damage = 0;
        if (this.defender_health <= 0){
          this.defender_health += 100;
          this.kill_unit();
        }
      }
    }
  };

  this.kill_unit = function(){
    for (var i = 0; i < this.unit_types.length; i++){
      var wrap_index = (i + this.remove_index + 1)%this.unit_types.length;
      if (this[this.unit_types[wrap_index]] > 0){
        this.remove_index = wrap_index;
        break;
      }
    }
    this[this.unit_types[this.remove_index]]--;
    var all_dead = true;
    for (i = 0; i < this.unit_types.length; i++){
      if (this[this.unit_types[i]] > 0){
        all_dead = false;
        break;
      }
    }
    return all_dead;
  };

  this.get_total = function(){
    var total = 0;
    for (var i = 0; i < this.unit_types.length; i++){
      total += this[this.unit_types[i]];
    }
    return total;
  };

  this.clear_units = function(){
    for (var i = 0; i < this.unit_types.length; i++){
      this[this.unit_types[i]] = 0;
    }
  };
};

var Player = function(player_num){
  this.number = player_num;
  this.money = 0;
  this.wind = new Upgrade();
  this.water = new Upgrade();
  this.fire = new Upgrade();
  this.earth = new Upgrade();

  this.purchase_upgrade = function(type){
    this.money -= this[type].purchase();
  };
};

var Upgrade = function(){
  this.i = 0;
  this.attack = [20,24,28,32,36,40];
  this.cost = [0,20,40,60,80,100];

  this.can_purchase = function(money){
    if (this.i == this.cost.length) return false;
    return money >= this.cost[this.i+1];
  }

  this.purchase = function(){
    this.i++;
    return this.cost[this.i];
  };

  this.get_attack = function(){
    return this.attack[this.i];
  };
};


var BattleField = function(p1,p2,d1,d2){
  var element_bane = {
    wind : 'water',
    water : 'fire',
    fire : 'earth',
    earth : 'wind'
  };

  this.defender_1 = d1;
  this.defender_2 = d2;
  this.player_1 = p1;
  this.player_2 = p2;

  this.bane_attack = function(){
    var player_1_damage = {};
    var player_2_damage = {};
    for (var bane in element_bane){
      player_1_damage[bane] = this.player_1[bane].get_attack() * this.defender_1[bane];
      player_2_damage[bane] = this.player_2[bane].get_attack() * this.defender_2[bane];
    }
    for (bane in element_bane){
      this.defender_1.damage_type(element_bane[bane],player_2_damage[bane]);
      this.defender_2.damage_type(element_bane[bane],player_1_damage[bane]);
    }
  };

  this.standard_attack = function(){
    var player_1_damage = 0;
    var player_2_damage = 0;
    for (var bane in element_bane){
      player_1_damage += this.player_1[bane].get_attack() * this.defender_1[bane];
      player_2_damage += this.player_2[bane].get_attack() * this.defender_2[bane];
    }
    this.defender_1.recieve_damage(player_2_damage);
    this.defender_2.recieve_damage(player_1_damage);
  }

  this.resolve_conflict = function(){
    this.bane_attack();
    while(this.defender_1.get_total() > 0 && this.defender_2.get_total() > 0){
      this.standard_attack();
    }
  };

};



