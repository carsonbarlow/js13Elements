
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

  this.get_strength = function(){
    var total = 0;
    for (var i = 0; i < this.unit_types.length; i++){
      for (var j = 0; j < this[this.unit_types[i]].length; j++){
        total += parseInt((this[this.unit_types[i]][j].attack/20)/(this[this.unit_types[i]][j].health/100));
      }
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
  this.money = masterConfig.starting_funds;
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
  this.state = 'idle'; // idle, hover, selected, dimmed
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

  this.get_strength = function(){
    return this.defenders.get_strength();
  };
};

var WarZone = function(){
  this.territories = [];

  this.census = function(player_num){ // make tests
    var population = 0;
    for (var i = 0; i < this.territories.length; i++){
      if (this.territories[i].owner == player_num){
        population += this.territories[i].defenders.get_total();
      }
    }
    return population;
  };

  this.collect_tribute = function(player_num){ // make tests
    var tribute = 0;
    for (var i = 0; i < this.territories.length; i++){
      if (this.territories[i].owner == player_num){
        tribute += this.territories[i].tribute;
      }
    }
    return tribute;
  };

  this.refresh_player_troops = function(player_num){ // make tests
    for (var i = 0; i < this.territories.length; i++){
      if (this.territories[i].owner == player_num){
        this.territories[i].defenders.refresh_units();
      }
    }
  };

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

  this.update_fog_of_war = function(num){
    for (var i = 0; i < this.territories.length; i++){
      this.territories[i].fog = true;
    }
    for (i = 0; i < this.territories.length; i++){
      if (this.territories[i].owner == num){
        this.territories[i].fog = false;
        // console.log(this.territories[i].neighbors);
        for (var neighbor in this.territories[i].neighbors){
          // console.log(this.territories[i].neighbors[neighbor]);
          if (!!this.territories[i].neighbors[neighbor]){
            this.territories[i].neighbors[neighbor].fog = false;
          }
        }
      }
    }
  };

  this.mouse_input_update = function(mi){
    var closes_territory;
    var x_diff;
    var y_diff;
    var current_hyp;
    var shortest_hyp = 9999;
    var winning_territory;
    for (var i = 0; i < this.territories.length; i++){
      if (this.territories[i].state != 'selected' && (this.territories[i].state != 'dimmed' && !this.territories[i].fog)){
        this.territories[i].state = 'idle';
        x_diff = mi.x - this.territories[i].pos_x;
        y_diff = mi.y - this.territories[i].pos_y;
        current_hyp = (x_diff*x_diff)+(y_diff*y_diff);
        current_hyp = Math.sqrt(current_hyp);
        if (current_hyp < shortest_hyp){
          shortest_hyp = current_hyp;
          winning_territory = i;
        }
      }
    }
    if (shortest_hyp <= 60){
      this.territories[winning_territory].state = 'hover';
    }
  };

  this.mouse_click = function(mi){
    for (var i = 0; i < this.territories.length; i++){
      if (this.territories[i].state == 'hover'){
        this.territories[i].state = 'selected';
        // IM HERE
      }else if(this.territories[i].state == 'selected'){
        this.territories[i].state = 'idle';
      }
    }
  }

};

var GameMaster = function(){
  this.game_state = 'unstarted';
  this.active_player = null;
  this.opponent_player = null,
  this.warZone = new WarZone();
  this.ui = new UI();
  this.ui.set_warZone(this.warZone);

  this.set_active_player = function(id){
    this.active_player = new Player(id);
    if (id == 1){
      this.opponent_player = new Player(2);
    }else{
      this.opponent_player = new Player(1);
    }
  };

  this.player_start_turn = function(player){  // make tests
    player.prayers += masterConfig.prayers_per_turn - this.warZone.census(player.number);
    player.money += this.warZone.collect_tribute(player.number);
    this.warZone.refresh_player_troops(player.number);
    this.game_state = 'make_purchases';
    this.warZone.update_fog_of_war(this.active_player.number);
  };

  this.player_end_turn = function(player){ // make tests
    this.game_state = 'turn_ended';
    if (player == this.opponent_player){
      this.player_start_turn(this.active_player);
    }
  };
};

var UI = function(){

  this.set_warZone = function(warZone){
    this.warZone = warZone;
  };

  this.select_territory = function(id){
    // clear details div
    var myNode = document.getElementById("select_territory");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    var territory = this.warZone.territories[id];
    for (var i = 0; i < territory.defenders.wind.length; i++){
      myNode.insertAdjacentHTML('<div class="wind_troop '+(territory.defenders.wind[i]-20)/4+'_power">');
      // IM HERE
      // add territory.defenders.wind[i] to the gui
    }
    for (var i = 0; i < territory.defenders.water.length; i++){
      // add territory.defenders.water[i] to the gui
    }
    for (var i = 0; i < territory.defenders.fire.length; i++){
      // add territory.defenders.fire[i] to the gui
    }
    for (var i = 0; i < territory.defenders.earth.length; i++){
      // add territory.defenders.earth[i] to the gui
    }
  };
};

var Graphics = function(){
  this.canvas = document.querySelector("#warzone_canvas");
  this.context = this.canvas.getContext('2d');
  this.draw_lists = {
    bg: []
  };
  this.updated = false;

  this.t = function(){
    var _this = this;
    this.draw = function(){
      // if (_this.updated){return false;}
      _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
      if (_this.territories != null){_this.draw_territories(_this.territories)};
      // _this.updated = true;
      return true;
    };
  };
  this.t();

  this.assign_territories = function(t){
    this.territories = t;
  };

  this.draw_territories = function(territories){
    var t_colors = {
      p1 : [30,30,230],
      p2 : [230,30,30],
      p3  : [150,150,150],
      idle : [0,0,0],
      hover : [15,15,15],
      selected : [40,40,40],
      dimmed : [-120,-120,-120]
    };
    var ctx = this.context;
    ctx.textAlign="center";
    for (var i = 0; i < territories.length; i++){
      var x = territories[i].pos_x,
        y = territories[i].pos_y,
        f_color = t_colors['p'+territories[i].owner].slice(0);
      for (var j = 0; j < 3; j++){
        f_color[j] += t_colors[territories[i].state][j];
      }
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x-30, y-52);
      ctx.lineTo(x+30, y-52);
      ctx.lineTo(x+52, y);
      ctx.lineTo(x+30, y+52);
      ctx.lineTo(x-30, y+52);
      ctx.lineTo(x-52, y);
      ctx.lineTo(x-30, y-52);
      ctx.fillStyle = 'rgb('+f_color.toString()+')';
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      
      if (!territories[i].fog){
        ctx.fillStyle = '#000000';
        ctx.font="20px Arial";
        ctx.fillText(''+territories[i].get_strength(),x,y-15);
      }
      
      ctx.font="12px Arial";
      if (territories[i].treasure > 0 && territories[i].treasure_awarded.indexOf(gm.active_player) == -1){ //yuck!
        ctx.beginPath();
        ctx.arc(x+0.5, y+30, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'goldenrod';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.fillText(''+territories[i].treasure,x,y+35);
      }

      if (!!territories[i].capital){
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.stroke();
      }
      
    }
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(territories[1].pos_x-52,territories[1].pos_y);
    ctx.lineTo(territories[1].pos_x-30,territories[1].pos_y+52);
    ctx.lineTo(territories[1].pos_x+30,territories[1].pos_y+52);

    ctx.moveTo(territories[2].pos_x-30,territories[2].pos_y+52);
    ctx.lineTo(territories[2].pos_x+30,territories[2].pos_y+52);

    ctx.moveTo(territories[6].pos_x+52,territories[6].pos_y);
    ctx.lineTo(territories[6].pos_x+30,territories[6].pos_y+52);

    ctx.moveTo(territories[7].pos_x+52,territories[7].pos_y);
    ctx.lineTo(territories[7].pos_x+30,territories[7].pos_y+52);

    ctx.moveTo(territories[9].pos_x-30,territories[9].pos_y-52);
    ctx.lineTo(territories[9].pos_x-52,territories[9].pos_y);
    ctx.lineTo(territories[9].pos_x-30,territories[9].pos_y+52);
    ctx.lineTo(territories[9].pos_x+30,territories[9].pos_y+52);

    ctx.moveTo(territories[11].pos_x+52,territories[11].pos_y);
    ctx.lineTo(territories[11].pos_x+30,territories[11].pos_y+52);

    ctx.moveTo(territories[12].pos_x+52,territories[12].pos_y);
    ctx.lineTo(territories[12].pos_x+30,territories[12].pos_y+52);

    ctx.moveTo(territories[15].pos_x+30,territories[15].pos_y+52);
    ctx.lineTo(territories[15].pos_x+52,territories[15].pos_y);
    ctx.lineTo(territories[15].pos_x+30,territories[15].pos_y-52);
    ctx.lineTo(territories[15].pos_x-30,territories[15].pos_y-52);

    ctx.moveTo(territories[17].pos_x-30,territories[17].pos_y+52);
    ctx.lineTo(territories[17].pos_x+30,territories[17].pos_y+52);

    ctx.moveTo(territories[18].pos_x+-30,territories[18].pos_y-52);
    ctx.lineTo(territories[18].pos_x+30,territories[18].pos_y-52);
    ctx.lineTo(territories[18].pos_x+52,territories[18].pos_y);

    ctx.stroke();

    return true;
  };

  this.initiate = function(){
    if( window.webkitRequestAnimationFrame) {
      window.each_frame = function(cb) {
        var _cb = function() { cb(); requestAnimationFrame(_cb); }
        _cb();
      };
    } else if (window.mozRequestAnimationFrame) {
      window.each_frame = function(cb) {
        var _cb = function() { cb(); mozRequestAnimationFrame(_cb); }
        _cb();
      };
    } else {
      window.each_frame = function(cb) {
        setInterval(cb, 1000 / 30);
      }
    }
    window.each_frame(this.draw);
  };
};

var MouseInput = function(){
  this.canvas = document.querySelector("#warzone_canvas");
  this.x = 0;
  this.y = 0;
  this.observers = [];

  // var g = new Graphics();

  this.add_observer = function(obj){
    var is_there = false;
    for (var i = 0; i < this.observers.length; i++){
      if (this.observers[i] == obj){
        is_there = true;
        break;
      }
    }
    if (!is_there){this.observers.push(obj);}
  };

  this.remove_observer = function(obj){
    for (var i = 0; i < this.observers.length; i++){
      if (this.observers[i] == obj){
        this.observers.splice(i,1);
        break;
      }
    }
  };

  this.initiate = function(){
    var _this = this;
    this.canvas.addEventListener('mousemove',function(event){
      _this.x = event.x;
      _this.y = event.y;
      for (var i = 0; i < _this.observers.length; i++){
        _this.observers[i].mouse_input_update(_this);
      }
    });
    this.canvas.addEventListener('click',function(event){
      for (var i = 0; i < _this.observers.length; i++){
        _this.observers[i].mouse_click(_this);
      }
    });
  };
};

var SVG_Maker = function(){
  var defalut_style = {
    f: 'none', //fill
    s: '#231f20', //stroke
    sl: 'square', //stroke-linecap
    sm: '10' //stroke-miterlimit
  };
  var draw_specs = {
    earth: {
      w: 50,
      h: 50,
      paths : [
        [27,7,48,39,17,45,1,39,20,5,25,11,27,7],
        [14,22,20,11,25,17,27,13,30,18,27,16,26,22,20,15,14,22]
      ],
      path_styles: [
        {f:'#996633'},
        {f:'#cccccc'}
      ]
    }
  };

  var draw_comp = {
    big_earth_little_earth: [
      {name: 'earth', pos: [0,0], scale: 200},
      {name: 'earth', pos: [25,25], scale: 100},
    ]
  };

  var compile_style = function(name, index){
    var return_style = 'style="fill:';
    return_style += (!!draw_specs[name].path_styles[index].f)? draw_specs[name].path_styles[index].f : 'none';
    return_style += ';stroke:';
    return_style += (!!draw_specs[name].path_styles[index].s)? draw_specs[name].path_styles[index].s : '#231f20';
    return_style += ';stroke-linecap:';
    return_style += (!!draw_specs[name].path_styles[index].sl)? draw_specs[name].path_styles[index].sl : 'square';
    return_style += ';stroke-miterlimit:';
    return_style += (!!draw_specs[name].path_styles[index].sm)? draw_specs[name].path_styles[index].sm : '10';
    return return_style+';"';
  };

  var make_paths = function(name, pos, scale){
    var path = '';
    for (var i = 0; i < draw_specs[name].paths.length; i++){
      path += '<path d="M ';
      for (var j = 0; j < draw_specs[name].paths[i].length; j+=2){
        path += ''+((draw_specs[name].paths[i][j]*scale/100)+pos[0])+','+((draw_specs[name].paths[i][j+1]*scale/100)+pos[1])+' ';
      }
      path += '"' + compile_style(name,i) + ' />';
    }
    return path;
  };

  this.make_composite = function(name){
    var max_width = 0, max_height = 0;
    for (specs in draw_comp[name]){
      if (max_width < draw_specs[draw_comp[name][specs].name].w * draw_comp[name][specs].scale) {max_width = draw_specs[draw_comp[name][specs].name].w * draw_comp[name][specs].scale;}
      if (max_height < draw_specs[draw_comp[name][specs].name].h * draw_comp[name][specs].scale) {max_height =  draw_specs[draw_comp[name][specs].name].h * draw_comp[name][specs].scale;}
    }
    var dom = '<svg width="'+(max_width/100)+'" height="'+(max_height/100)+'" xml:space="preserve">';
    for (var i = 0; i < draw_comp[name].length; i++){
      dom += make_paths(draw_comp[name][i].name, draw_comp[name][i].pos, draw_comp[name][i].scale);
    }
    dom += '</svg>';
    return dom;
  };

  this.make_svg = function(name, pos, scale){
    var dom = '<svg width="'+(draw_specs[name].w*scale/100)+'" height="'+(draw_specs[name].h*scale/100)+'" xml:space="preserve">';
    dom += make_paths(name, pos, scale);
    dom += '</svg>';
    return dom;
  };
};


var masterConfig = { // neighbors are solid, ...
  prayers_per_turn: 100,
  starting_funds : 20,
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


var graphics = new Graphics();
var gm = new GameMaster();

var mouseInput = new MouseInput();
mouseInput.initiate();
mouseInput.add_observer(gm.warZone);

svg_maker = new SVG_Maker();
window.onload = function(){
  SC = new ServerConnect(gm);
  document.querySelector('#warzone_canvas').style.visibility="hidden";
  document.querySelector('#join_screen').style.visibility="hidden";
  document.querySelector('.btn--red').addEventListener('click',SC.create_game);
  document.querySelector('.btn--blue').addEventListener('click',SC.join_game_screen);
  document.querySelector('#join_game_submit').addEventListener('click',SC.join_game_submit);

  document.querySelector('body').insertAdjacentHTML( 'beforeend', '<svg width="50" height="50" xml:space="preserve"><path d="M 27,7 48,39 17,45 1,39 20,5 25,11 27,7" style="fill:#996633;stroke:#231f20;stroke-linecap:square;stroke-miterlimit:10" /><path d="M 14,22 20,11 25,17 27,13 30,18 27,16 26,22 20,15 14,22" style="fill:#cccccc;stroke:#231f20;stroke-linecap:square;stroke-miterlimit:10" /></svg>' );
  document.querySelector('body').insertAdjacentHTML( 'beforeend', svg_maker.make_svg('earth',[0,0],100));
  document.querySelector('body').insertAdjacentHTML( 'beforeend', svg_maker.make_svg('earth',[0,0],150));
  document.querySelector('body').insertAdjacentHTML( 'beforeend', svg_maker.make_composite('big_earth_little_earth'));
  // SC.create_game();
};


var ServerConnect = function(_gm){
  var gm = _gm;
  var socket = io();
  var room_number;
  var opponent_socket;
  this.create_game = function(){
    gm.set_active_player(1);
    socket.emit('pairing_option',{type: 'create'});
  };
  this.join_game_screen = function(){
    document.querySelector('#title_screen').style.visibility="hidden";
    document.querySelector('#join_screen').style.visibility="visible";
    // 
  };
  this.join_game_submit = function(){
    var game_number = document.querySelector('#input_game_number').value;
    if (game_number != ''){
      gm.set_active_player(2);
      socket.emit('pairing_option',{type: 'join', number: game_number});
    }
  };

  socket.on('session_created', function(msg){
    room_number = msg;
    document.querySelector('#join_screen').style.visibility="hidden";
    document.querySelector('#title_screen').style.visibility="hidden";
    document.querySelector('#warzone_canvas').style.visibility="visible";
    gm.warZone.build();
    gm.player_start_turn(1);
    graphics.assign_territories(gm.warZone.territories);
    graphics.initiate();
  });


  // this.initiate = function(){
  //   var room_number;


  // };
};





