App = {
  web3Provider: null,
  contracts: {},
  currentAccount:null,
  receiveAdress:'0x96Bb5438E0bE3bB591dF03312249cd301EED0B44',

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },
setStatus: function(status,data){
  var container = $("#container");
  if (typeof status != 'undefined')
    container.find('.status').append('<br>'+status);
  if (typeof data != 'undefined')
    container.find('.data').append('<br>'+data);
},
  initWeb3: async function() {
  // Modern dapp browsers...
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
      // User denied account access...
      App.setStatus("User denied account access");
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    //App.web3Provider = new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws");
    //App.web3Provider = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws'));
  }
  web3 = new Web3(App.web3Provider);
var connected = web3.isConnected();
if(!connected){
  console.log("node not connected!");
  App.setStatus("node not connected!","");
}else{
  console.log("node connected");
  App.setStatus("node connected","");
}
    //get account
    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    App.currentAccount = accounts[0];
      App.setStatus('','cur:'+App.currentAccount);
      App.setStatus('','rev:'+App.receiveAdress);
    });
    
    return App.initContract(); 
  },
  initContract: function() {
    $.getJSON('HOURToken.json', function(data) {
      //App.contracts.hor =  new web3.eth.contract(data, '0x3592C65FeCd68aCb68A9b5A506AF501c39162954');
      var abi = data;
      var adr = '0x3592C65FeCd68aCb68A9b5A506AF501c39162954';
      App.contracts.HourToken = web3.eth.contract(abi).at(adr);      
    })
    
    App.setStatus('合约初始化完毕','');
    return App.bindEvents();
  },
  bindEvents: function() {
    
    $(document).on('click', '.btn', App.handleNotice);
    $(document).on('click', '.btn_HOR', App.handleRecharge);
    App.setStatus('增加按钮点击事件','');
  },
  handleNotice: function(){
    // 使用事件发生器
web3.eth.sendTransaction({
    from: App.currentAccount,
    to: App.receiveAdress,
    value: parseInt($('#ipt').val())
},function(error,result){
  App.setStatus(result);
})

  },
  handleRecharge: function(event) {
   // App.contracts.hor.transfer('0x9f4118d4e1C95FCE14dC9ac932e48965aeE2D9e4',12.9)
    App.contracts.HourToken.transfer(App.receiveAdress,parseInt($('#ipt').val()),function(error,result){
      App.setStatus('转账成功！',result);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});
