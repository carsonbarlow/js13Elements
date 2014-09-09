var testing = true;

var upgrade = new Upgrade();
cbt.describe('Upgrade: can_purchase');
cbt.should('check if you can buy the next tier', true, upgrade.can_purchase(20));
cbt.should('return false if you cannot afford it', false, upgrade.can_purchase(19));
upgrade.i = upgrade.attack.length;
cbt.should('return false if there are no more upgrades left', false, upgrade.can_purchase(100000));

upgrade.i = 0;
cbt.describe('Upgrade: get_attack');
cbt.should('return the current attack', 20, upgrade.get_attack());

cbt.describe('Upgrade: purchase');
cbt.should('return the amount of money it took to make the purchase', 20, upgrade.purchase());

var troopFactory = new TroopFactory();
cbt.describe('TroopFactory');
var troop = troopFactory.makeTroop('fire',1);
cbt.should('make troops with the given kind','fire',troop.kind);
cbt.should('make muliple troops at a time', 10, troopFactory.makeTroop('water',10).length);
troopFactory.setAttack('fire',30);
troop = troopFactory.makeTroop('fire',1);
cbt.should('make troops with the assigned attack power', 30, troop.attack);
troopFactory.setAttack('fire',20);

var defenders = new Defenders();
cbt.describe('Defenders: add_unit');
defenders.add_unit(troopFactory.makeTroop('fire',10));
cbt.should('add units of the specified kind',10,defenders.fire.length);
cbt.should('not add other units', 0, defenders.wind.length);
defenders.add_unit(new Troop('earth', 20));
cbt.should('add single units too',1,defenders.earth.length);
defenders.add_unit([new Troop('earth',20), new Troop('water', 20)]);
cbt.should('add different kinds of troops at the same time', [2,1],[defenders.earth.length,defenders.water.length]);
cbt.describe('Defenders: clear_units');
defenders.clear_units();
cbt.should('remove all units',0, defenders.fire.length);

cbt.describe('Defenders: remove_unit');
defenders.add_unit(troopFactory.makeTroop('fire',10));
troop = defenders.fire[5];
troop.health = 50;
var total_health = 0;
for (var i = 0; i < defenders.fire.length; i++){
  total_health += defenders.fire[i].health;
}
cbt.should('pretest..',950,total_health);
defenders.remove_unit(troop);
total_health = 0;
for (i = 0; i < defenders.fire.length; i++){
  total_health += defenders.fire[i].health;
}
cbt.should('remove the specified unit', 900, total_health);

cbt.describe('Defenders: get_total');
defenders.clear_units();
defenders.add_unit(troopFactory.makeTroop('wind',5));
defenders.add_unit(troopFactory.makeTroop('water',3));
defenders.add_unit(troopFactory.makeTroop('earth',1));
cbt.should('return the sum of all the units', 9, defenders.get_total());

cbt.describe('Defenders: damage_kind');
defenders.clear_units();
defenders.add_unit(troopFactory.makeTroop('water',3));
defenders.add_unit(new Troop('fire', 20));
defenders.damage_kind('water',75);
var outcome_array = [];
for (i = 0; i < defenders.water.length; i++){
  outcome_array.push(defenders.water[i].health);
}
outcome_array.push(defenders.fire[0].health);
cbt.should('evenly distribute damage to all units of that kind',[75,75,75,100],outcome_array);
defenders.water[1].health = 25;
defenders.damage_kind('water',150);
outcome_array = [];
for (i = 0; i < defenders.water.length; i++){
  outcome_array.push(defenders.water[i].health);
}
outcome_array.push(defenders.fire[0].health);
cbt.should('kill and remove dead units from the defender\'s object',[25,25,100],outcome_array);

cbt.describe('Defenders: deploy_units');
defenders.clear_units();
defenders.add_unit(troopFactory.makeTroop('wind',5));
defenders.add_unit(troopFactory.makeTroop('water',3));
defenders.add_unit(troopFactory.makeTroop('earth',1));
defenders.remove_index = 3;
outcome_array = defenders.deploy_units(6);
for (i = 0; i < outcome_array.length; i++){
  outcome_array[i] = outcome_array[i].kind;
}
cbt.should('evenly deploy unit types',["wind", "water", "earth", "wind", "water", "wind"],outcome_array);
cbt.should('remove those units from the defender object', 3, defenders.get_total());

cbt.describe('BattleField: troop_fight');
var defender1 = new Defenders();
var defender2 = new Defenders();
var battleField = new BattleField(defender1,defender2);
var troop1 = new Troop('fire',20);
var troop2 = new Troop('water',20);

battleField.troop_fight(troop1,troop2);
cbt.should('deal damage to one another',[80,80],[troop1.health,troop2.health]);
troop1.health = 10;
troop2.health = 100;
battleField.troop_fight(troop1,troop2);
cbt.should('never overkill, and mitigate damage accordingly',[0,90],[troop1.health,troop2.health]);
troop1.health = 10;
troop2.health = 100;
troop1.attack = 40;
battleField.troop_fight(troop1,troop2);
cbt.should('..',[0,80],[troop1.health,troop2.health]);
troop1.health = 10;
troop2.health = 100;
troop1.attack = 20;
troop2.attack = 40;
battleField.troop_fight(troop1,troop2);
cbt.should('..',[0,95],[troop1.health,troop2.health]);

cbt.describe('BattleField: bane_attack');
defender1.add_unit(troopFactory.makeTroop('wind',3));
defender2.add_unit(troopFactory.makeTroop('earth',6));
battleField.bane_attack();
outcome_array = []
for (i = 0; i < defender1.wind.length; i++){
  outcome_array.push(defender1.wind[i].health);
}
cbt.should('evenly distribute the damage to all opposing kinds',[60,60,60],outcome_array);
outcome_array = []
for (i = 0; i < defender2.earth.length; i++){
  outcome_array.push(defender2.earth[i].health);
}
cbt.should('but not kill the kinds that aren\'t weak',[100,100,100,100,100,100],outcome_array);
defender1.wind[1].health = 10;
battleField.bane_attack();
outcome_array = []
for (i = 0; i < defender1.wind.length; i++){
  outcome_array.push(defender1.wind[i].health);
}
cbt.should('will kill and remove casualties',[20,20],outcome_array);

cbt.describe('BattleField: standard_attack');
defender1.clear_units();
defender2.clear_units();
defender1.add_unit(troopFactory.makeTroop('fire',5));
defender2.add_unit(troopFactory.makeTroop('fire',5));

battleField.standard_attack(2);
outcome_array = []
for (i = 0; i < defender1.fire.length; i++){
  outcome_array.push(defender1.fire[i].health);
}
cbt.should('deploy the troops and have them attack each other for the specified amount of time',[60,60,60,60,60],outcome_array);
outcome_array = []
for (i = 0; i < defender2.fire.length; i++){
  outcome_array.push(defender2.fire[i].health);
}
cbt.should('..',[60,60,60,60,60],outcome_array);

defender1.clear_units();
defender2.clear_units();
defender1.add_unit(troopFactory.makeTroop('fire',2));
defender2.add_unit(troopFactory.makeTroop('fire',2));
defender1.fire[0].health = 20;
defender2.fire[0].health = 20;
battleField.standard_attack(1);
cbt.should('remove both units that kill each other',[1,1],[defender1.fire.length,defender2.fire.length]);

defender1.clear_units();
defender2.clear_units();
defender1.add_unit(troopFactory.makeTroop('fire',3));
defender2.add_unit(troopFactory.makeTroop('fire',2));
defender1.fire[2].health = 20;
battleField.standard_attack(2);
cbt.should('replace the fallen troops if able',[2,2],[defender1.fire.length,defender2.fire.length]);
outcome_array = []
for (i = 0; i < defender1.fire.length; i++){
  outcome_array.push(defender1.fire[i].health);
}
cbt.should('..',[80,60],outcome_array);
defender1.clear_units();
defender2.clear_units();
defender1.add_unit(troopFactory.makeTroop('fire',2));
defender2.add_unit(troopFactory.makeTroop('fire',3));
defender1.fire[1].health = 20;
battleField.standard_attack(2);
cbt.should('remove non-fighting troops when can\'t replace casualty',[1,3],[defender1.fire.length,defender2.fire.length]);
defender1.clear_units();
defender2.clear_units();
defender1.add_unit(troopFactory.makeTroop('fire',2));
defender2.add_unit(troopFactory.makeTroop('fire',3));
defender2.fire[2].health = 20;
battleField.standard_attack(2);
cbt.should('replace the fallen troops if able',[2,2],[defender1.fire.length,defender2.fire.length]);
outcome_array = []
for (i = 0; i < defender2.fire.length; i++){
  outcome_array.push(defender2.fire[i].health);
}
cbt.should('..',[80,60],outcome_array);
defender1.clear_units();
defender2.clear_units();
defender1.add_unit(troopFactory.makeTroop('fire',3));
defender2.add_unit(troopFactory.makeTroop('fire',2));
defender2.fire[1].health = 20;
battleField.standard_attack(2);
cbt.should('remove non-fighting troops when can\'t replace casualty',[3,1],[defender1.fire.length,defender2.fire.length]);

cbt.describe('BattleField: resolve_conflict');
defender1.clear_units();
defender2.clear_units();
defender1.add_unit(troopFactory.makeTroop('fire',5));
defender2.add_unit(troopFactory.makeTroop('fire',5));
battleField.resolve_conflict();
cbt.should('kill both evenly matched forces',[0,0],[defender1.get_total(),defender2.get_total()]);
defender1.clear_units();
defender2.clear_units();
defender1.add_unit(troopFactory.makeTroop('fire',5));
defender2.add_unit(troopFactory.makeTroop('fire',5));
defender1.fire[0].attack = 24;
battleField.resolve_conflict();
cbt.should('leave a forece standing when unevenly matched',[1,0],[defender1.get_total(),defender2.get_total()]);
cbt.should('..',16,defender1.fire[0].health);

defender1.clear_units();
defender2.clear_units();
troopFactory.setAttack('fire',5);
defender1.add_unit(troopFactory.makeTroop('fire',1));
defender2.add_unit(troopFactory.makeTroop('fire',5));
troopFactory.setAttack('fire',20);
defender1.fire[0].attack = 50;
battleField.resolve_conflict();
cbt.should('properly weigh in attack value with health/size of army',[1,0],[defender1.get_total(),defender2.get_total()]);
cbt.should('..',50,defender1.fire[0].health);

defender1.clear_units();
defender2.clear_units();
defender1.add_unit(troopFactory.makeTroop('fire',5));
defender2.add_unit(troopFactory.makeTroop('water',5));
battleField.resolve_conflict();
cbt.should('properly use bane_attack',[0,5],[defender1.get_total(),defender2.get_total()]);
cbt.should('..',40,defender2.water[0].health);
