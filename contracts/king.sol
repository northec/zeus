pragma solidity ^0.5.10;

contract king {
    address payable public kinger;
    address payable public owner;
    uint public balance;
    
    uint public komax;
    
    
    struct koer{
        uint count;
        uint balance;
    }
    
    mapping(address => koer) public koers;
    
    modifier onlyKinger(){
        require(msg.sender == kinger,"only alow king withdraw!");
        _;
    }
    
    modifier onlyOwner(){
        require(msg.sender == owner,"only alow owner manage!");
        _;
    }
    
    constructor() public payable{
        owner = msg.sender;
        komax = msg.value;
        kinger = msg.sender;
        
        koers[msg.sender].balance = msg.value;
        koers[msg.sender].count = 1;
        
        balance = msg.value;
    }
    
    function ko() public payable returns(bool){
        koers[msg.sender].balance += msg.value;
        koers[msg.sender].count += 1;
        balance += msg.value;

        if(msg.value > komax){
            kinger = msg.sender;
            komax = msg.value;
            
            return true;
        }else{
            return false;
        }
    }
    
    function withdraw() public onlyKinger{
        uint canDraw = (balance - koers[msg.sender].balance) / 2 + koers[msg.sender].balance;
        koers[msg.sender].balance = 0;
        balance = balance - canDraw;
        kinger.transfer(canDraw);
        kinger = address(0);
    }
    
    function getKinger() public view returns(address,uint,uint){
        return(kinger,koers[kinger].count,koers[kinger].balance);
    }
    
    function destory() public onlyOwner{
        selfdestruct(owner);
    } 
    
    function ownerTranserShip(address payable _newOwner) public onlyOwner{
        owner = _newOwner;
    }
    
    function getBalance() public view returns(uint){
        return address(this).balance;
    }
}