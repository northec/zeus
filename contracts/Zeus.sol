pragma solidity ^0.5.0;

contract Zeus {
    
    //balance
    uint balance;//game balance
    uint gBalance;//this game balance
    uint dBalance;//today balance
    
    //divide into
    uint8 digitalDiv;//digital game divide
    uint8 parityDiv;//parity divide
    
    //join price
    uint8 digitalPrice;//join game ETH price
    uint8 cardPrice;//bug card ETH price
    
    //card can buy count
    uint8 canBuyCount;
    
    constructor() public {
    balance=0;//game balance
    gBalance=0;//this game balance
    dBalance=0;//today balance
    
    //divide into
    digitalDiv = 0.35;//digital game divide
    parityDiv = 0.15;//parity divide
    
    //join price
    digitalPrice = 0.1 ether;//join game ETH price
    cardPrice = 0.5 ether;//bug card ETH price
    
    //card can buy count
    canBuyCount = 5;
       
    }
    
    
}
