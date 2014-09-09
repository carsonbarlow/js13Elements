
var Troop = function(kind, attack){
  this.kind = kind;
  this.health = 100;
  this.attack = attack;
};

var TroopFactory = function(){
  this.attack = {
    wind: 20,
    water: 20,
    earth: 20,
    fire: 20
  };

  this.setAttack = function(kind, attack){
    this.attack[kind] = attack;
  };

  this.makeTroop = function(kind, quantity){
    if (quantity > 1){
      var troop_array = [];
      for (var i = 0; i < quantity; i++){
        troop_array.push(new Troop(kind, this.attack[kind]));
      }
      return troop_array;
    }else{
      return new Troop(kind, this.attack[kind]);
    }
  };
}


var Territory = function(){
  this.owner = 0;
  this.defenders = new Defenders();
};

var Defenders = function(){
  this.unit_types = ['wind','water','fire','earth'];
  this.remove_index = parseInt(Math.random()*this.unit_types.length);
  for (var i = 0; i < this.unit_types.length; i++){
    this[this.unit_types[i]] = [];
  }

  this.add_unit = function(unit){
    if (unit instanceof Troop){
      this[unit.kind].push(unit);
    }else if (Object.prototype.toString.call(unit) === '[object Array]'){
      for (var i = 0; i < unit.length; i++){
        this[unit[i].kind].push(unit[i]);
      }
    }
  };

  this.remove_unit = function(unit){
    this[unit.kind].splice(this[unit.kind].indexOf(unit),1);
  };

  this.damage_kind = function(kind,damage){
    var split_damage = parseInt(damage/this[kind].length);
    for (var i = 0; i < this[kind].length; i++){
      this[kind][i].health -= split_damage;
      if (this[kind][i].health <= 0){
        this[kind].splice(i,1);
        i--;
      }
    }
  }

  this.deploy_units = function(num){
    var deploy_array = [];
    while (num > 0){
      for (var i = 0; i < this.unit_types.length; i++){
        //find the next available troop
        var wrap_index = (i + this.remove_index + 1)%this.unit_types.length;
        if (this[this.unit_types[wrap_index]].length > 0){
          this.remove_index = wrap_index;
          break;
        }
      }
      deploy_array.push(this[this.unit_types[this.remove_index]].pop());
      num--;
    }
    return deploy_array;
  };

  this.get_total = function(){
    var total = 0;
    for (var i = 0; i < this.unit_types.length; i++){
      total += this[this.unit_types[i]].length;
    }
    return total;
  };

  this.clear_units = function(){
    for (var i = 0; i < this.unit_types.length; i++){
      this[this.unit_types[i]] = [];
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

  this.troopFactory = new TroopFactory();

  this.purchase_upgrade = function(type){
    this.money -= this[type].purchase();
    this.troopFactory.setAttack(type,this[type].get_attack());
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


var BattleField = function(d1,d2){
  var element_bane = {
    wind : 'water',
    water : 'fire',
    fire : 'earth',
    earth : 'wind'
  };

  this.defender_1 = d1;
  this.defender_2 = d2;

  this.bane_attack = function(){
    var player_1_damage = {};
    var player_2_damage = {};
    for (var bane in element_bane){
      player_1_damage[bane] = 0;
      player_2_damage[bane] = 0;
      for (var i = 0; i < this.defender_1[bane].length; i++){
        player_1_damage[bane] += this.defender_1[bane][i].attack;
      }
      for (i = 0; i < this.defender_2[bane].length; i++){
        player_2_damage[bane] += this.defender_2[bane][i].attack;
      }
    }
    for (bane in element_bane){
      this.defender_1.damage_kind(element_bane[bane],player_2_damage[bane]);
      this.defender_2.damage_kind(element_bane[bane],player_1_damage[bane]);
    }
  };

  this.standard_attack = function(rounds){
    var defender_1_total = this.defender_1.get_total();
    var defender_2_total = this.defender_2.get_total();
    var lowest_total = (defender_1_total < defender_2_total)? defender_1_total : defender_2_total;
    var defender_1_array = this.defender_1.deploy_units(lowest_total);
    var defender_2_array = this.defender_2.deploy_units(lowest_total);

    while (rounds > 0){
      for(var i = 0; i < lowest_total; i++){
        var troop1 = defender_1_array[i];
        var troop2 = defender_2_array[i];
        this.troop_fight(troop1,troop2);

        if (troop1.health <= 0 && troop2.health <= 0){
          defender_1_array.splice(i,1);
          defender_2_array.splice(i,1);
          i--;
          lowest_total--;
        }else if (troop1.health <= 0){
          if (this.defender_1.get_total() > 0){
            defender_1_array.splice(i,1,this.defender_1.deploy_units(1)[0]);
          }else{
            defender_1_array.splice(i,1);
            this.defender_2.add_unit(defender_2_array.splice(i,1));
            i--;
            lowest_total--;
          }
        }else if (troop2.health <= 0){
          if (this.defender_2.get_total() > 0){
            defender_2_array.splice(i,1,this.defender_2.deploy_units(1)[0]);
          }else{
            this.defender_1.add_unit(defender_1_array.splice(i,1));
            defender_2_array.splice(i,1);
            i--;
            lowest_total--;
          }
        }
      }
      rounds--;
    }
    this.defender_1.add_unit(defender_1_array);
    this.defender_2.add_unit(defender_2_array);
  };

  this.troop_fight = function(troop1,troop2){
    if (troop1.attack > troop2.health || troop2.attack > troop1.health){
      var health_ratio = troop1.health/troop2.health;
      var attack_ratio = troop2.attack/troop1.attack;
      var damage_ratio;
      if (health_ratio > attack_ratio){
        damage_ratio = troop2.health/troop1.attack;
      }else{
        damage_ratio = troop1.health/troop2.attack;
      }
      troop1.health -= Math.ceil(troop2.attack*damage_ratio);
      troop2.health -= Math.ceil(troop1.attack*damage_ratio);
    }else{
      troop1.health -= troop2.attack;
      troop2.health -= troop1.attack;
    }
  };

  this.resolve_conflict = function(){  //needs testing
    while(this.defender_1.get_total() > 0 && this.defender_2.get_total() > 0){
      this.bane_attack();
      this.standard_attack(3);
    }
  };

};



