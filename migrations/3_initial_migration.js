const king = artifacts.require("king");

module.exports = function(deployer) {
  deployer.deploy(king);
};
