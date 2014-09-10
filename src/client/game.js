
var Troop = function(kind, attack){
  this.kind = kind;
  this.health = 100;
  this.attack = attack;
  this.movement_max = 1;
  this.movement = 1;
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

var Defenders = function(){
  this.unit_types = ['wind','water','fire','earth'];
  this.remove_index = parseInt(Math.random()*this.unit_types.length);
  for (var i = 0; i < this.unit_types.length; i++){
    this[this.unit_types[i]] = [];
  }

  this.refresh_units = function(){ //need tests
    for (var i = 0; i < this.unit_types.length; i++){
      for (var j = 0; j < this[this.unit_types[i]].length; j++){
        this[this.unit_types[i]][j].movement = this[this.unit_types[i]][j].movement_max;
      }
    }
  };

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
  };

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

  this.resolve_conflict = function(){
    while(this.defender_1.get_total() > 0 && this.defender_2.get_total() > 0){
      this.bane_attack();
      this.standard_attack(3);
    }
  };
};

// end of battle system

// players and territories

var Upgrade = function(){
  this.i = 0;
  this.attack = [20,24,28,32,36,40];
  this.cost = [0,20,30,40,50,60];

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

var Player = function(player_num){
  this.number = player_num;
  this.money = 0;
  this.prayers = 0;

  this.wind = new Upgrade();
  this.water = new Upgrade();
  this.fire = new Upgrade();
  this.earth = new Upgrade();

  this.troopFactory = new TroopFactory();

  this.purchase_upgrade = function(type){
    this.money -= this[type].purchase();
    this.troopFactory.setAttack(type,this[type].get_attack());
  };

  this.purchase_troop = function(type, territory){ // make tests
    this.prayers -= 10;
    territory.defenders.add_unit(this.troopFactory.makeTroop(type));
  };
};

var Territory = function(){
  this.owner = 0;
  this.tribute = 1;
  this.treasure = 0;
  this.treasure_awarded = [];
  this.defenders = new Defenders();
  this.contenders = new Defenders();
  this.neighbors = {
    north: null,
    north_east: null,
    south_east: null,
    south: null,
    south_west: null,
    north_west: null
  };

  // this should have an object to manage this function to allow for 'cancel' and 'confirm/attack'
  this.transfer = function(territory, unit){
    var target_defender = (this.owner == territory.owner)? territory.defenders : territory.contenders;
    this.defenders.remove_unit(unit);
    target_defender.add_unit(unit);
    unit.movement--;
  };

  this.change_owner = function(player){
    var has_awarded = false;
    for (var i = 0; i < this.treasure_awarded.length; i++){
      if (this.treasure_awarded[i] == player){
        has_awarded = true;
      }
    }
    if (!has_awarded){
      this.treasure_awarded.push(player);
      player.money += this.treasure;
    }
    this.owner = player.number;
    this.defenders = this.contenders;
    this.contenders = new Defenders();
  };
};

var WarZone = function(){
  this.territories = [];

  this.build = function(){
    var troopFactory = new TroopFactory();
    var width = 5;
    var height = 5;
    var t_id = 1,
      cord_x = 30+150,
      cord_y = 52+30;
    var horz = 82;
    var vert = 52;

    for (var h = 0; h < height-1; h++){
      for (var w = 0; w < width; w++){
        // this.territories.push(new Territory(t_id,cord_x,cord_y));
        var territory = new Territory();
        territory.pos_x = cord_x;
        territory.pos_y = cord_y;
        // t_id++;
        cord_x += horz;
        cord_y += vert;
        cord_y = Math.round(cord_y*10)/10;
        vert = -vert;

        this.territories.push(territory);
      }
      cord_x -= (horz * (width));
      cord_y += -vert;
      cord_y = Math.round(cord_y*10)/10;
      vert = -vert;
    }
    for (w = 0; w < Math.ceil(width/2); w++){
      // this.territories.push(new Territory(t_id,cord_x,cord_y));
      var territory = new Territory();
        territory.pos_x = cord_x;
        territory.pos_y = cord_y;
      // t_id++;
      cord_x += (horz * 2);
      this.territories.push(territory);
    }
    // connect/populate the territories
    var config;
    for (var i = 0; i < this.territories.length; i++){
      config = masterConfig.territories['t'+i];
      if (!!config.north){this.connect_territories(this.territories[i],this.territories[config.north],'north');}
      if (!!config.north_west){this.connect_territories(this.territories[i],this.territories[config.north_west],'north_west');}
      if (!!config.north_east){this.connect_territories(this.territories[i],this.territories[config.north_east],'north_east');}
      if (!!config.wind){this.territories[i].defenders.add_unit(troopFactory.makeTroop('wind',config.wind));}
      if (!!config.water){this.territories[i].defenders.add_unit(troopFactory.makeTroop('water',config.water));}
      if (!!config.fire){this.territories[i].defenders.add_unit(troopFactory.makeTroop('fire',config.fire));}
      if (!!config.earth){this.territories[i].defenders.add_unit(troopFactory.makeTroop('earth',config.earth));}
      if (!!config.player){this.territories[i].owner = config.player;}else{this.territories[i].owner = 3;}
      if (!!config.treasure){this.territories[i].treasure = config.treasure;}
      this.territories[i].capital = !!config.capital;
    }
  };

  this.connect_territories = function(t1,t2,border){
    var connections = {
      north : 'south',
      north_west: 'south_east',
      north_east: 'south_west'
    };
    t1.neighbors[border] = t2;
    t2.neighbors[connections[border]] = t1;
  };

};

var masterConfig = { // neighbors are solid, ...
  territories: {
    t0:  {north: 5, north_east: 1, fire: 7, treasure: 5},
    t1:  {north_east: 7, wind: 2},
    t2:  {north_west: 1, north_east: 3, wind: 1, water: 1, fire: 1, earth: 1},
    t3:  {north_west: 7, north: 8, wind: 2},
    t4:  {north_west: 3, north: 9, earth: 3},
    t5:  {north: 10, north_east: 6, wind: 1, water: 1, fire: 1, earth: 1, player: 1},
    t6:  {north_west: 10, north: 11, wind: 5, water: 5, fire: 5, earth: 5, player: 1, capital: true},
    t7:  {north_west: 6, north: 12, earth: 1},
    t8:  {north_west: 12, north: 13, north_east: 14, fire: 1},
    t9:  {water: 12, treasure: 10},
    t10: {north_east: 11, wind: 2, water: 2, fire: 2, earth: 2, player: 1},
    t11: {north: 16, wind: 1},
    t12: {north_west: 11, north: 17, wind: 4, water: 4, fire: 4, earth: 4, treasure: 15},
    t13: {north_west: 17, north_east: 19, wind: 5, water: 5, fire: 5, earth: 5, player: 2, capital: true},
    t14: {north_west: 13, north: 19, wind: 2, water: 2, fire: 2, earth: 2, player: 2},
    t15: {north: 20, earth: 16, treasure: 10},
    t16: {north_west: 20, north_east: 21, fire: 2},
    t17: {north_west: 16, north_east: 18, water: 1},
    t18: {north_west: 21, north_east: 22, fire: 2},
    t19: {north: 22, wind: 1, water: 1, fire: 1, earth: 1, player: 2},
    t20: {water: 3},
    t21: {wind: 1, water: 1, fire: 1, earth: 1},
    t22: {wind: 7, treasure: 5}
  }
};