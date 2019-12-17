App = {
  web3Provider: null,
  contracts: {},
  currentAccount:null,
  receiveAdress:'0x96Bb5438E0bE3bB591dF03312249cd301EED0B44',

  init: async function() {
    // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

    return await App.initWeb3();
  },
setStatus: function(status,data){
  // var container = $("#container");
  // if (typeof status != 'undefined')
  //   container.find('.status').append('<br>'+status);
  // if (typeof data != 'undefined')
  //   container.find('.data').append('<br>'+data);
  console.log(Date.now());
  if (typeof status != 'undefined' && status != ''){
    console.log(status);
  }
  if (typeof data != 'undefined' && data != ''){
  console.log(data);
  }
  console.log("------------------------------------");
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
// var connected = web3.isConnected();
// if(!connected){
//   console.log("node not connected!");
//   App.setStatus("node not connected!","");
// }else{
//   console.log("node connected");
//   App.setStatus("node connected","");
// }
    App.setStatus(web3.isConnected()?"connected":"not connected");
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
    $.getJSON('js/HOURToken.json', function(data) {
      var abi = data;
      //ropstan:0x089cc3bdfb623f3ddba2ade63cf78fae48c5089f
      //ethereum:0x3592C65FeCd68aCb68A9b5A506AF501c39162954
      var adr = '0x089cc3bdfb623f3ddba2ade63cf78fae48c5089f';
      App.contracts.HourToken = web3.eth.contract(abi).at(adr); 
      App.setStatus('hor合约初始化完毕'); 
    });
    $.getJSON('js/king.json', function(data) {
      var abi = data;
      var adr = '0x1A722E28Fc92FE9A49919Bae56265b99400e27Ea';
      App.contracts.king = web3.eth.contract(abi).at(adr); 
      App.setStatus('king合约初始化完毕'); 

       //初始化游戏奖池
        var balancetotal=0;
      
        App.contracts.king.getBalance(function(error,result){
          App.setStatus(result);
          balancetotal = result.c[0] / 10**18;
        });
        App.contracts.king.getKinger(function(error,result){
          App.setStatus(result);
          $("#winner").html("total balance:"+balancetotal+"<br> current winner:"+result[0]+"<br>winner ko count:"+result[1].toString()+"<br>winner balance:"+(result[2] / 10**18).toString());
        });
    });
    
    return App.bindEvents();
  },
  bindEvents: function() {
    
    $(document).on('click', '.btn', App.handleNotice);
    $(document).on('click', '.btn_HOR', App.handleRecharge);
    $(document).on('click', '.btnKO', App.handleKO);
    App.setStatus('增加按钮点击事件','');


   
  },
  handleKO: function(event){
    var count =0;
    count = web3.toWei(parseInt($(event.target).data('votecount')) * 0.01);
    App.setStatus(count);
    App.contracts.king.ko({from:App.currentAccount,value:count},function(error,result){
      App.setStatus(result);
      App.contracts.king.getKinger(function(error,result){
        App.setStatus(result);
        $("#winner").html("winner:"+result[0]+"<br>count:"+result[1].toString()+"<br>balance:"+(result[2] / 10**18).toString());
      });
    });    
  },
  handleNotice: function(){
    // ETH充值
    var value = $('#ipt').val()*10**18;
    web3.eth.sendTransaction({
        from: App.currentAccount,
        to: App.receiveAdress,
        value: value
    },function(error,result){
      App.setStatus(result);
    })
  },
  handleRecharge: function(event) {
    var value = $('#ipt').val()*10**8;
    App.setStatus(value);
    App.contracts.HourToken.transfer(App.receiveAdress,value,function(error,result){
      App.setStatus('转账成功！',result);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});
