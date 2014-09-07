// This is a very simplified testing suite to get my tdd experience off the ground.

var cbt = {};

cbt.current_description = "";
cbt.passed = false;


cbt.describe = function(what){cbt.current_description = what;console.log('');};

cbt.should = function(description, expected, actual){
  if (Object.prototype.toString.call(expected) == '[object Array]'){
    if (expected.length != actual.length){
      cbt.passed = false;
    }else{
      cbt.passed = true;
      for (var i = 0; i < expected.length; i++){
        if (expected[i] != actual[i]){
          cbt.passed = false;
          break;
        }
      }
    }
  }else{
    cbt.passed = (expected == actual);
  }
  
  var log = cbt.current_description + " should " + description + ".";
  log = (cbt.passed)? "Passed:  "  + log : "Failed => expected: '" + expected + "', got: '" + actual + "'.  :" + log;
  console.log(log);
}
