jQuery(function() {
  'use strict';

  var newiineMessageVisibleTime = 6000;
  // お礼メッセージを表示する時間の長さを変更できます（単位はミリ秒。6000＝6秒）

  // ------------------------------------------

  // ここから下は基本的にいじらないでください

  // ------------------------------------------

  // 自分の設置されているURLの取得
  var root;
  
  var script = document.querySelector('script[src$="newiine.js"]');
  var match = script.src.match(/(^|.*\/)newiine\.js$/);
  if (match) {
      root = match[1];
  }

  var ajaxPath = root+'_ajax.php';

  var newIinePathname = location.href;

  var iineItemButton = [];
  var iineItemButtonArray = [];
  var iineItemButtonName = [];
  var iineItemButtonCount = [];
  var iineItemButton = document.getElementsByClassName('newiine_btn');
  var iineItemThanksMessage = [];
  var newiineRandMessageFlag = [];
  var newiineBox = [];
  var newiineBoxLength = [];
  

  for (var i = 0; i < iineItemButton.length; i++) {
    iineItemButtonArray[i] =  iineItemButton[i];
    newiineRandMessageFlag[i] = false;
    iineItemButtonName[i] = iineItemButton[i].dataset.iinename;
    if(iineItemButton[i].getElementsByClassName('newiine_count')[0] !== undefined) {
        iineItemButtonCount[i] = iineItemButton[i].getElementsByClassName('newiine_count')[0];
    } else {
        iineItemButtonCount[i] = null;
    }

    if(iineItemButton[i].getElementsByClassName('newiine_thanks')[0] !== undefined) {
      iineItemThanksMessage[i] = iineItemButton[i].getElementsByClassName('newiine_thanks')[0];
      newiineBox[i] = iineItemThanksMessage[i].querySelectorAll('.newiine_box');
      newiineBoxLength[i] = newiineBox[i].length;
    } else {
      iineItemThanksMessage[i] = null;
      newiineBox[i] = null;
    }
    
  }

  const newiineTargets = iineItemButtonArray;

  var newiineUpdateCount = function(h, res) {
    if(iineItemButtonCount[h] !== null) {
      iineItemButtonCount[h].innerHTML = res;
    }
  }


  var newiineFadeout = function(e, i) {
    setTimeout(function(){
      e.classList.add('newiine_fadeout');
    }, newiineMessageVisibleTime);
    setTimeout(function(){
      e.style.display = "none";
      e.classList.remove('newiine_fadeout');
      newiineRandMessageFlag[i] = false;
    }, newiineMessageVisibleTime + 500);
   }

  var newiineAjaxFailed = false;
  var newiineClickAjaxFailed = false;

  newiineTargets.forEach(function(target, h) {
    jQuery.ajax({
        type: 'GET',
        url : ajaxPath,
        data:{ buttonname: iineItemButtonName[h] }
      }).done(function(res){
        var data_arr = JSON.parse(res); //戻り値をJSONとして解析
        newiineUpdateCount(h, data_arr[0]);
        if(data_arr[1] == true) {
          iineItemButtonArray[h].classList.add('newiine_clickedtoday');
        }
      }).fail(function(XMLHttpRequest, textStatus, errorThrown){
        if(!newiineAjaxFailed) {
          alert('いいねボタン改エラー：\nお使いのサーバーでPHPが使えるか、\nまた設置方法に誤りがないか確認してください。');
          console.log(XMLHttpRequest);
          console.log(textStatus);
          console.log(errorThrown);
        }
        newiineAjaxFailed = true;
        });

      //クリックしたときの処理
    target.addEventListener('click', function(e) {
        e.preventDefault();

        if(typeof target.dataset.iineurl !== "undefined"){
          newIinePathname = target.dataset.iineurl;
        }

        var iineNewCountLimit;
        if(target.dataset.iinecountlimit > 0){
          iineNewCountLimit = target.dataset.iinecountlimit;
        } else {
          iineNewCountLimit = false;
        }
    
        // ajax処理
        jQuery.post(ajaxPath, {
          path: newIinePathname,
          buttonname: iineItemButtonName[h],
          iineNewCountLimit: iineNewCountLimit,
          mode: 'check'
        }).done(function(res){
          try {
            JSON.parse(res);
            var data_arr = JSON.parse(res); //戻り値をJSONとして解析
            newiineUpdateCount(h, data_arr[0]);
            // アニメーション
            if(iineItemButtonArray[h].classList.contains('newiine_animate')) {
              iineItemButtonArray[h].classList.add('newiine_animate');
              setTimeout(function(){
                iineItemButtonArray[h].classList.remove('newiine_animate');
              },500);
            }
            
            iineItemButtonArray[h].classList.add('newiine_clicked');
            var bros = [];
            for (var i = 0; i < iineItemButton.length; i++) {
              if(iineItemButtonName[i] === iineItemButtonName[h] && i !== h) {
                  bros.push(i);
              }
            }
            if(bros.length > 0) {
              bros.forEach((e) => {
                newiineUpdateCount(e, data_arr[0]);
                iineItemButtonArray[e].classList.add('newiine_clicked');
              });
            }

            if(iineItemThanksMessage[h] === null) {
              return;
            }

            iineItemThanksMessage[h].style.display = "block";

            if(!newiineRandMessageFlag[h]) {
              newiineFadeout(iineItemThanksMessage[h], h);
            }

            if(newiineBox[h][1] && !newiineRandMessageFlag[h]) {
              
            var iineRand = Math.floor(Math.random() * newiineBoxLength[h]);
              for (let i = 0; i < newiineBoxLength[h]; i++) {
                if(i == iineRand) {
                  newiineBox[h][i].style.display = 'block';
                } else {
                  newiineBox[h][i].style.display = 'none';
                }
              }
            }
            newiineRandMessageFlag[h] = true;

          } catch (error) {
            if(res === 'upper') {
              console.log('一日のクリック上限に達しました');
            } else if(res === 'denyIP') {
              console.log('このIPアドレスは拒否されています');
            } else if(res === 'else') {
              console.log('その他の問題があるようです');
            }
          }
        }).fail(function(){
          if(!newiineClickAjaxFailed) {
            alert('いいねボタン改エラー：\nいいねボタンの設置方法が正しいか確認してください。');
          }
          newiineClickAjaxFailed = true;
        });
    });
});

});