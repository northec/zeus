App = {
  web3Provider: null,
  contracts: {},
  currentAccount:null,
  receiveAdress:'0x96Bb5438E0bE3bB591dF03312249cd301EED0B44',
  network:null,//网络识别码1主网3ropstan
  reged:false,//true:reged;false:not reged
  fc:null,//from code


  init: async function() {
    //get fromcode from url where param key :fc,for example http://xxw.coo.com/?fc=2s32c323
    App.fc = $.getUrlParam('fc');
    App.setStatus("fc:"+App.fc);
    
    return await App.initWeb3();
  },
setStatus: function(status,data){

  var today=new Date();
  var h=today.getHours();
  var m=today.getMinutes();
  var s=today.getSeconds();
  var ms =today.getUTCMilliseconds();

  console.log(">>>"+h+":"+m+":"+s+":"+ms);
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
      // User denied account  access...
      App.setStatus("User denied account access");
    }
    $("#msg").html('window.ethereum');
    $("#msg").hide();
  }

  else {
    App.setStatus("Looks like you need a Dapp browser to get started.<br>Consider installing MetaMask!");
    $("#msg").html('Looks like you need a Dapp browser to get started.<br>Consider installing MetaMask!');
    $("#container").hide();
    return;
  }
  web3 = new Web3(App.web3Provider);

    App.setStatus(web3.isConnected()?"connected":"not connected");
    //get account
    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    App.currentAccount = accounts[0];
    web3.version.getNetwork(function(err,res){
      App.network = res;
      App.setStatus('network2:'+App.network);
      App.setStatus('','cur:'+App.currentAccount);
      App.setStatus('','rev:'+App.receiveAdress);
      //event change with wallet change
      ethereum.on('accountsChanged', App.initWeb3);
      ethereum.on('networkChanged', App.initWeb3);
  
      return App.initContract();   
    })    
    });
  },
  initContract: function() {
    $.getJSON('js/HOURToken.json', function(data) {
      var abi = data;
      //ropstan:0x089cc3bdfb623f3ddba2ade63cf78fae48c5089f
      //ethereum:0x3592C65FeCd68aCb68A9b5A506AF501c39162954
      var adr ;
      adr = (App.network == 1) ?'0x3592C65FeCd68aCb68A9b5A506AF501c39162954':'0x089cc3bdfb623f3ddba2ade63cf78fae48c5089f';
      App.setStatus("cur chainid:"+web3.currentProvider.chainId);
      App.setStatus("cur hor address:"+adr);
      App.contracts.HourToken = web3.eth.contract(abi).at(adr); 
      App.setStatus('hor合约初始化完毕'); 
    });
    $.getJSON('js/king.json', function(data) {
      var abi = data;
      var adr = '0x1A722E28Fc92FE9A49919Bae56265b99400e27Ea';
      App.contracts.king = web3.eth.contract(abi).at(adr); 
      App.setStatus('king合约初始化完毕'); 

       //初始化游戏奖池
      App.updatePanel();
    });
    
    return App.bindEvents();
  },
  bindEvents: function() {
    
    $(document).on('click', '.btn', App.handleETH);
    $(document).on('click', '.btn_HOR', App.handleHOR);
    $(document).on('click', '.btnKO', App.handleKO); 
  },
  updatePanel:function(){
    //网络及钱包信息
    chainId = web3.currentProvider.chainId;

    $("#netinfo").html("当前网络状态:"+(App.network == 1 ? "主网" : (App.network == 3 ?"RopStan测试网络":("未知网络"+App.network))));    
    web3.eth.getBalance(web3.eth.accounts[0],function(e,r){
      $("#walletinfo").html("当前钱包:0x...."+ web3.eth.accounts[0].slice(-4)
                            + "(余额："+r/10**18+")");
    });
    //初始化游戏奖池
    var balancetotal=0;
    var komax = 0;
    var winner;
    //check if current account join the game
    App.contracts.king.koers(App.currentAccount,function(error,result){
      App.reged = result[0] != 0 ;      
      App.setStatus("reged:"+App.reged.toString());
      if(App.reged || App.fc != null && App.fc != ""){
        $("#msg").hide();
        $("#youxi").show();
      }else{
        $("#msg").html("deny for no invite code! <br>this game only for invite!");
        $("#msg").show();
        $("#youxi").hide();
      }
    });
    //get balance
    App.contracts.king.getBalance(function(error,result){
      balancetotal = result / 10**18;
    });
    //get kingmaxprice
    App.contracts.king.komax(function(error,result){
      komax= result / 10**18;
    });
    App.contracts.king.getKinger(function(error,result){
      winner = result[0];
      winner = winner.substring(0,4) + "......" + winner.slice(-4);
      $("#winner").html("奖池:"+balancetotal
            +"ETH<br> 单注最高:"+komax
            +"ETH<br> 王者荣耀:"+winner
            +"<br>参与次数:"+result[1].toString()
            +"<br>总参额度:"+(result[2] / 10**18).toString()+"ETH");
    });
  },
  handleKO: function(event){
    var count =0;
    count = web3.toWei(parseInt($(event.target).data('votecount')) * 0.01);
    App.setStatus(count);
    App.contracts.king.ko({from:App.currentAccount,value:count},function(error,result){
      App.setStatus(result);
      //初始化游戏奖池
      App.updatePanel();
    });    
  },
  handleETH: function(){
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
  handleHOR: function(event) {
    var value = $('#ipt').val()*10**8;
    App.setStatus(value);
    App.contracts.HourToken.transfer(App.receiveAdress,value,function(error,result){
      App.setStatus('转账成功！',result);
    });
  }
};

$(function() {
  //ext jquery function to get invitecode
  (function ($) {
    $.getUrlParam = function (name) {
     var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if (r != null) return unescape(r[2]); return null;
    }
   })(jQuery);
   //App start
  $(window).load(function() {
    App.init();
  });
});
