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

var defenders = new Defenders();
cbt.describe('Defenders: add_unit');
defenders.add_unit('fire',10);
cbt.should('add units of the specified kind',10,defenders.fire);
cbt.should('not add other units', 0, defenders.wind);
cbt.describe('Defenders: clear_units');
defenders.clear_units();
cbt.should('remove all units',0, defenders.fire);

cbt.describe('Defenders: get_total');
defenders.clear_units();
defenders.add_unit('wind', 5);
defenders.add_unit('water', 3);
defenders.add_unit('earth', 1);
cbt.should('return the sum of all the units', 9, defenders.get_total());

cbt.describe('Defenders: kill unit');
defenders.clear_units();
defenders.remove_index = 0;
defenders.add_unit('wind', 5);
defenders.add_unit('water', 3);
defenders.add_unit('earth', 1);
defenders.kill_unit();
cbt.should('move index to next unit type', 1, defenders.remove_index);
cbt.should('kill off one of the next in line', 2, defenders.water);
defenders.kill_unit();
cbt.should('skip empty unit types', 3, defenders.remove_index);
defenders.kill_unit();
defenders.kill_unit();
defenders.kill_unit();
defenders.kill_unit();
defenders.kill_unit();
cbt.should('leave the most numerous unit type before total anniallation', 2, defenders.wind);
cbt.should('not have other kinds of units',0, defenders.water);
cbt.should('return false if there are any units left', false, defenders.kill_unit());
cbt.should('return true if all units are eliminated', true, defenders.kill_unit());

cbt.describe('Defenders: recieve_damage');
defenders.clear_units();
defenders.remove_index = 0;
defenders.add_unit('wind', 5);
defenders.add_unit('water', 3);
defenders.add_unit('earth', 1);
defenders.recieve_damage(200);
cbt.should('remove 2 units if 200 damage was presented', 7, defenders.get_total());
defenders.recieve_damage(75);
cbt.should('not kill when non-fatal damage is issued', 7, defenders.get_total());
defenders.recieve_damage(30);
cbt.should('kill a unit when it\'s health is low', 6, defenders.get_total());
cbt.should('roll over damage to the next unit', 95, defenders.defender_health);
defenders.recieve_damage(10000);
cbt.should('never kill more units than are defending', 0, defenders.get_total());

cbt.describe('Defenders: damage_type');
defenders.clear_units();
defenders.defender_health = 80;
defenders.remove_index = 0;
defenders.add_unit('wind', 5);
defenders.add_unit('water', 3);
defenders.add_unit('earth', 1);
defenders.damage_type('water',200);
cbt.should('only deal damage to/kill the unit type specified', 1, defenders.water);
defenders.damage_type('water',85);
cbt.should('kill off the last of a unit type and roll over the damage', 0, defenders.water);
cbt.should('..',95,defenders.defender_health);
defenders.water = 5;
defenders.damage_type('water', 1000);
cbt.should('not spill damage onto other units', 5, defenders.wind);
cbt.should('..', 1, defenders.earth);

cbt.describe('Defenders: remove_unit');
defenders.earth = 10;
cbt.should('return the value that was removed', 3, defenders.remove_unit('earth',3));
cbt.should('leave the remove the units', 7, defenders.earth);
cbt.should('return only what was removed, not what was asked for', 7, defenders.remove_unit('earth',10));

var player1 = new Player(1);
var player2 = new Player(2);
var defender1 = new Defenders();
var defender2 = new Defenders();
defender1.add_unit('wind',10);
defender2.add_unit('water',10);
battleField = new BattleField(player1,player2,defender1,defender2);
cbt.describe('BattleField: bane_attack');
battleField.bane_attack();
cbt.should('damage the units that are weak against the other element',8,defender2.water);
cbt.should('not damage other units',10,defender1.wind);

cbt.describe('BattleField: standard_attack');
defender1.clear_units();
defender2.clear_units();
defender1.add_unit('wind',10);
defender2.add_unit('water',5);
defender1.defender_health = 100;
defender1.defender_health = 100;
battleField.standard_attack();
cbt.should('damage both sides indiscriminately',9,defender1.wind);
cbt.should('..',3,defender2.water);

cbt.describe('BattleField: resolve_conflict');
defender1.clear_units();
defender2.clear_units();
defender1.add_unit('fire',10);
defender2.add_unit('water',10);
defender1.defender_health = 100;
defender2.defender_health = 100;
battleField.resolve_conflict();
cbt.should('leave at least one side dead',0,defender1.get_total());
cbt.should('levy casualties on the other side', 6, defender2.get_total());
defender1.clear_units();
defender2.clear_units();
defender1.add_unit('water',10);
defender2.add_unit('water',10);
defender1.defender_health = 100;
defender2.defender_health = 100;
battleField.resolve_conflict();
cbt.should('be able to kill both sides', 0, defender1.get_total());
cbt.should('..', 0, defender2.get_total());

// defender1.clear_units();
// defender2.clear_units();
// defender1.defender_health = 100;
// defender2.defender_health = 100;
// defender1.add_unit('water',10);
// defender2.add_unit('water',8);
// // player1.purchase_upgrade('water');
// battleField.resolve_conflict();
// console.log(defender1.get_total() + '.' + defender1.defender_health);
// console.log(defender2.get_total() + '.' + defender2.defender_health);
