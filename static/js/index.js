function getPad(cb) {
  fetchPadId(getCurrDocOwner(), getCurrDocLink(), function(id) {
    var documents = JSON.parse(localStorage.getItem('documents') || '{}');
    if(id && documents[id]) {
      documents[id].timestamp = new Date().getTime();
      saveDocument(documents[id]);
      cb(documents[id]);
    } else {
      alert("Could not find document " + getCurrDocLink() + " from " + getCurrDocOwner());
    }
  });
}

function currentPad() {
  var documents = JSON.parse(localStorage.getItem('documents'));
  var index = JSON.parse(localStorage.getItem('index'));
  return documents[index[getCurrDocOwner() +'$'+ getCurrDocLink()]];
}


function connectToOwnpad(padInfo) {
  document.title = padInfo.title+' on Libre Docs &ndash; liberate your ideas';
  document.getElementsByTagName('h1')[0].innerHTML = docTitleSpan(padInfo);
  document.getElementById('signout').innerHTML = signupStatus();
  embedPad(padInfo);
}

// disabled for now... too slow and ugly
function showPreview(text) {
  if(!text || text == '') return;
  $('#previewPad').text(text);
  window.onblur = function() {
    $('#previewPad').hide();
  };
}

function docTitleSpan(pad) {
  if(isOwnPad(pad)) {
    return '<span id="docTitle" onmouseover="changeDocTitle();">'+pad.title+'</span>';
  } else {
    return '<span id="docTitle">'+pad.title+'</span>';
  }
}

function signupStatus() {
  var sessionObj = JSON.parse(localStorage.getItem('sessionObj'));
  // not signed in
  if(sessionObj == null || !sessionObj.userAddress) {
    return '<input type="submit" value="Sign in" onclick="location=\'/\';">';
  } else {
    return sessionObj.userAddress+'<a class="btn btn-danger" href="#" onclick="localStorage.clear();location=\'/\';"><i class="icon-remove icon-white"></i> Sign out</a>'
  }
}

function embedPad(pad) {
  $('#editorPad').pad({
    'padId':encodeURIComponent(pad.id),
    'userName':hyphenify(currentUser() || 'unknown'),
  });
}

function isOwnPad(pad) {
  return (pad.owner == currentUser());
}

var editingDocTitle;
function changeDocTitle() {
  if(!editingDocTitle) {
    editingDocTitle = true;
    document.getElementById('docTitle').innerHTML = '<input id="docTitleInput" onblur="saveDocTitle();" type="text" value="'+currentPad().title+'" />';
  }
}
function saveDocTitle() {
  editingDocTitle = false;
  getPad(function (pad){
    pad.title = document.getElementById('docTitleInput').value;
    pad.link = getLinkForPad(pad);
    saveDocument(pad);
    publishPadInfo(pad, function() {
      location.hash = '#'+getCurrDocOwner()+'/'+pad.link;
      document.getElementById('docTitle').innerHTML = pad.title;
    });
  });
}
function getCurrDocOwner() {
  if(location.hash.length) {
    return location.hash.split('/')[0].substring(1);
  } else {
    window.location = '/welcome.html';
  }
}
function getCurrDocLink() {
  if(location.hash.length) {
    return location.hash.substr(location.hash.indexOf('/') + 1);
  } else {
    window.location = '/welcome.html';
  }
}

function getLinkForPad(pad) {
  var link = pad.title.replace(/\s+/g, '-');
  // unchanged...
  if(link==getCurrDocLink()) return(link);
  var main = link;
  var postfix = 0;
  var key = getCurrDocOwner()+'$'+link;
  var index = JSON.parse(localStorage.index);
  while(index[key] && index[key] != pad.id) {
    postfix++;
    link = main + '-' + postfix;
    key = getCurrDocOwner()+'$'+link;
  }
  return encodeURIComponent(link);
}

function hyphenify(userAddress) {
  return userAddress.replace(/-/g, '-dash-').replace(/@/g, '-at-').replace(/\./g, '-dot-');
}

function unhyphenify(userAddress) {
  return userAddress.replace(/-dot-/g, '.').replace(/-at-/g, '@').replace(/-dash-/g, '-');
}

document.getElementsByTagName('body')[0].setAttribute('onload', 'getPad(connectToOwnpad);');
document.getElementById('loading').style.display='none';
